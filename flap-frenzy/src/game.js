/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Constants, GlobalComponent } from './global';
import {
	Group,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	SRGBColorSpace,
	TextureLoader,
} from 'three';

import { PlayerComponent } from './player';
import { System } from 'elics';
import { Text } from 'troika-three-text';
import { generateUUID } from 'three/src/math/MathUtils';
import localforage from 'localforage';

const SCORE_BOARD_TEXTURE = new TextureLoader().load(
	Constants.SCORE_BOARD_TEXTURE_PATH,
);
SCORE_BOARD_TEXTURE.colorSpace = SRGBColorSpace;

/**
 * GameSystem class handles the main game logic.
 */
export class GameSystem extends System {
	init() {
		this._initializeProperties();
		this._loadStoredData();
	}

	_initializeProperties() {
		this._flapData = {
			left: { y: null, distance: 0, flaps: 0 },
			right: { y: null, distance: 0, flaps: 0 },
		};
		this._ring = null;
		this._ringNumber = null;
		this._ringTimer = Constants.RING_INTERVAL;
		this._scoreBoard = null;
		this._playerId = null;
		this._record = null;

		this._currentScore = createText(0);
		this._recordScore = createText(2);
		this._worldRecord = createText(0);
		this._ranking = createText(0);
	}

	_loadStoredData() {
		localforage.getItem(Constants.RECORD_SCORE_KEY).then((score) => {
			if (score) {
				this._recordScore.text = score.toString();
				this._record = score;
				this._recordScore.sync();
			}
		});
		localforage.getItem(Constants.PLAYER_ID_KEY).then((playerId) => {
			if (playerId) {
				this._playerId = playerId;
			} else {
				this._playerId = generateUUID();
				localforage.setItem(Constants.PLAYER_ID_KEY, this._playerId);
			}
		});
	}

	update(delta) {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);

		const player = this.getEntities(this.queries.player)[0].getComponent(
			PlayerComponent,
		);

		this._setupScoreBoard(player);
		this._manageGameStates(global, player, delta);
	}

	_setupScoreBoard(player) {
		if (!this._scoreBoard) {
			this._scoreBoard = new Mesh(
				new PlaneGeometry(2, 1),
				new MeshBasicMaterial({ map: SCORE_BOARD_TEXTURE, transparent: true }),
			);
			player.space.add(this._scoreBoard);
			this._scoreBoard.position.set(0, 1.5, -2);

			// Add score texts to the scoreboard
			this._addTextToScoreBoard(this._currentScore, -0.15, -0.22);
			this._addTextToScoreBoard(this._recordScore, -0.15, -0.36);
			this._addTextToScoreBoard(this._ranking, 0.8, -0.22);
			this._addTextToScoreBoard(this._worldRecord, 0.8, -0.36);
		}
	}

	_addTextToScoreBoard(text, x, y) {
		this._scoreBoard.add(text);
		text.position.set(x, y, 0.001);
	}

	_manageGameStates(global, player, delta) {
		const isPresenting = global.renderer.xr.isPresenting;
		const rotator = player.space.parent;
		this._scoreBoard.visible = false;

		if (!this._ring && global.scene.getObjectByName('ring')) {
			this._initializeRing(player, global, rotator);
		}

		if (global.gameState === 'lobby') {
			this._handleLobbyState(player, rotator, isPresenting, global);
		} else {
			this._handleInGameState(player, global, rotator, delta);
		}
	}

	_initializeRing(player, global, rotator) {
		this._ring = global.scene.getObjectByName('ring');
		this._ringRotator = new Group();
		this._ringRotator.add(this._ring);
		this._ring.position.set(0, 4, 34);
		this._ringRotator.quaternion.copy(rotator.quaternion);
		this._ringRotator.rotateY(
			Constants.PLAYER_ANGULAR_SPEED * Constants.RING_INTERVAL,
		);
		this._ring.position.y = player.space.position.y;
		this._ring.scale.setScalar(Constants.STARTING_RING_SCALE);

		const ringNumber = new Text();
		this._ring.add(ringNumber);
		ringNumber.text = '0';
		ringNumber.fontSize = 0.6;
		ringNumber.anchorX = 'center';
		ringNumber.anchorY = 'middle';
		ringNumber.rotateY(Math.PI);
		ringNumber.sync();

		this._ringNumber = ringNumber;
		global.scene.add(this._ringRotator);
	}

	_handleLobbyState(player, rotator, isPresenting, global) {
		if (isPresenting) {
			this._scoreBoard.visible = true;
			for (let entry of Object.entries(player.controllers)) {
				const [handedness, controller] = entry;
				const thisFrameY = controller.targetRaySpace.position.y;
				const lastFrameY = this._flapData[handedness].y;

				this._manageFlapData(handedness, thisFrameY, lastFrameY);

				if (
					this._flapData[handedness].flaps >= Constants.NUM_FLAPS_TO_START_GAME
				) {
					this._startGame(global, rotator);
					break;
				}
			}
		}
	}

	_manageFlapData(handedness, thisFrameY, lastFrameY) {
		if (lastFrameY) {
			if (thisFrameY <= lastFrameY) {
				// flapping
				this._flapData[handedness].distance += lastFrameY - thisFrameY;
			} else {
				// flap has ended
				if (this._flapData[handedness].distance >= 0.5) {
					this._flapData[handedness].flaps += 1;
				} else if (this._flapData[handedness].distance > 0.1) {
					this._flapData[handedness].flaps = 0;
				}
				this._flapData[handedness].y = null;
				this._flapData[handedness].distance = 0;
			}
		}
		this._flapData[handedness].y = thisFrameY;
	}

	_startGame(global, rotator) {
		global.gameState = 'ingame';
		this._ringTimer;
		this._flapData = {
			left: { y: null, distance: 0, flaps: 0 },
			right: { y: null, distance: 0, flaps: 0 },
		};
		this._ringRotator.quaternion.copy(rotator.quaternion);
		this._ringRotator.rotateY(
			Constants.PLAYER_ANGULAR_SPEED * Constants.RING_INTERVAL,
		);
		this._ring.position.y = 4;
		this._ring.scale.setScalar(Constants.STARTING_RING_SCALE);
		this._ringTimer = Constants.RING_INTERVAL;
		this._ringNumber.text = '1';
		this._ringNumber.sync();
	}

	_handleInGameState(player, global, rotator, delta) {
		if (this._ring) {
			this._ringTimer -= delta;
			if (this._ringTimer < 0) {
				const ringRadius = this._ring.scale.x / 2;
				if (
					Math.abs(player.space.position.y - this._ring.position.y) < ringRadius
				) {
					this._updateScore(global, rotator);
				} else {
					this._endGame(player, global);
				}
			}
		}
	}

	_updateScore(global, rotator) {
		global.score += 1;
		this._ringNumber.text = (global.score + 1).toString();
		this._ringNumber.sync();
		this._ringRotator.quaternion.copy(rotator.quaternion);
		this._ringRotator.rotateY(
			Constants.PLAYER_ANGULAR_SPEED * Constants.RING_INTERVAL,
		);
		this._ring.position.y = Math.random() * 5 + 4;
		this._ring.scale.multiplyScalar(0.98);
		this._ringTimer = Constants.RING_INTERVAL;
	}

	_endGame(player, global) {
		this._currentScore.text = global.score.toString();
		this._currentScore.sync();
		if (global.score > this._record) {
			console.log('best score updated:', global.score);
			this._record = global.score;
			this._recordScore.text = global.score.toString();
			this._recordScore.sync();
			localforage.setItem(Constants.RECORD_SCORE_KEY, this._record);
		}
		global.gameState = 'lobby';
		global.score = 0;
		player.space.position.y = 4;
	}
}

GameSystem.queries = {
	global: { required: [GlobalComponent] },
	player: { required: [PlayerComponent] },
};

/**
 * Helper function to create a text mesh with default settings.
 * @param {number} defaultValue - The default value for the text.
 * @returns {Text} - The created text mesh.
 */
const createText = (defaultValue) => {
	const text = new Text();
	text.text = defaultValue.toString();
	text.fontSize = 0.12;
	text.anchorX = 'center';
	text.anchorY = 'middle';
	text.sync();
	return text;
};
