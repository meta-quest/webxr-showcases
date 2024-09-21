/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, System } from 'elics';
import { Group, Matrix4, Vector3 } from 'three';

import { GamepadWrapper } from 'gamepad-wrapper';
import { GlobalComponent } from './global';

/**
 * PlayerComponent represents the player's state and attributes in the game.
 */
export class PlayerComponent extends Component {}

/**
 * PlayerSystem manages the player's interactions and updates in the game.
 */
export class PlayerSystem extends System {
	init() {
		this._vec3 = new Vector3();
	}

	/**
	 * Sets up the player's space, controllers, and head in the game.
	 * @param {Object} global - The global component containing the renderer, camera, and scene.
	 */
	_setup(global) {
		const { renderer, camera, scene } = global;
		const controllers = {};
		const playerSpace = new Group();
		playerSpace.add(camera);

		for (let i = 0; i < 2; i++) {
			const controllerGrip = renderer.xr.getControllerGrip(i);
			scene.add(controllerGrip);
			const targetRaySpace = renderer.xr.getController(i);
			targetRaySpace.addEventListener('connected', async function (event) {
				this.handedness = event.data.handedness;
				const gamepadWrapper = new GamepadWrapper(event.data.gamepad);
				controllers[event.data.handedness] = {
					targetRaySpace: targetRaySpace,
					gripSpace: controllerGrip,
					gamepadWrapper: gamepadWrapper,
				};
				playerSpace.add(targetRaySpace, controllerGrip);
			});
			targetRaySpace.addEventListener('disconnected', function () {
				delete controllers[this.handedness];
			});
			scene.add(targetRaySpace);
		}

		const playerHead = new Group();
		playerSpace.add(playerHead);

		this.world.createEntity().addComponent(PlayerComponent, {
			space: playerSpace,
			head: playerHead,
			controllers: controllers,
		});
		scene.add(playerSpace);
	}

	/**
	 * Executes the system logic. Sets up the player if not set up yet, and updates the player's state.
	 */
	update() {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);

		const player = this.getEntities(this.queries.player)[0]?.getComponent(
			PlayerComponent,
		);

		if (!player) {
			this._setup(global);
		} else {
			Object.values(player.controllers).forEach((controllerObject) => {
				if (controllerObject) controllerObject.gamepadWrapper.update();
			});
			const xrManager = global.renderer.xr;
			const frame = xrManager.getFrame();
			const pose = frame?.getViewerPose(xrManager.getReferenceSpace());
			if (pose) {
				const headsetMatrix = new Matrix4().fromArray(
					pose.views[0].transform.matrix,
				);
				headsetMatrix.decompose(
					player.head.position,
					player.head.quaternion,
					this._vec3,
				);
			}
		}
	}
}

PlayerSystem.queries = {
	global: { required: [GlobalComponent] },
	player: { required: [PlayerComponent] },
};
