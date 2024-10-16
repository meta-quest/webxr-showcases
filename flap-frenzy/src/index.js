/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Importing main stylesheet
import './styles/index.css';

// Importing game systems and components
import { PlayerComponent, PlayerSystem } from './player';

import { Clock } from 'three';
import { FlapSystem } from './flap';
import { GameSystem } from './game';
import { GlobalComponent } from './global';
import { InlineSystem } from './landing';
import { World } from 'elics';
// Importing scene setup function
import { setupScene } from './scene';

// Create the world with the defined systems and components
const world = new World();
world
	.registerComponent(GlobalComponent)
	.registerComponent(PlayerComponent)
	.registerSystem(PlayerSystem)
	.registerSystem(FlapSystem)
	.registerSystem(GameSystem)
	.registerSystem(InlineSystem);
const clock = new Clock();

// Set up the main scene, camera, and renderer
const { scene, camera, renderer, gltfLoader } = setupScene();

// Create a global entity to store references to the renderer, camera, and scene
world.createEntity().addComponent(GlobalComponent, {
	renderer,
	camera,
	scene,
	gltfLoader,
	score: 0,
	gameState: 'lobby',
});

// Set the animation loop for rendering and game logic
renderer.setAnimationLoop(function () {
	const delta = clock.getDelta();
	const time = clock.elapsedTime;
	// Execute the ECS world logic
	world.update(delta, time);

	// Render the scene
	renderer.render(scene, camera);
});
