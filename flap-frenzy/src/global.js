/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from 'elics';

// Importing necessary types from becsy

/**
 * The GlobalComponent class represents a component that contains
 * global properties and settings used throughout the game.
 */
export class GlobalComponent extends Component {}

export const Constants = {
	// game constants
	NUM_FLAPS_TO_START_GAME: 3,
	PLAYER_ANGULAR_SPEED: Math.PI / 25,
	RING_INTERVAL: 3,
	STARTING_RING_SCALE: 5,
	GRAVITY: -9.81,
	FLAP_SPEED_MULTIPLIER: 0.1,

	// asset paths
	SCORE_BOARD_TEXTURE_PATH: 'assets/scoreboard.png',
	ENV_TEXTURE_PATH: 'assets/envmap.exr',
	SCENE_MODEL_PATH: 'assets/gltf/scene.gltf',
	WING_MODEL_PATH: 'assets/gltf/wing.gltf',

	// local storage keys
	RECORD_SCORE_KEY: 'record-score',
	PLAYER_ID_KEY: 'player-id',
};
