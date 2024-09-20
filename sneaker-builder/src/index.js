/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './styles/index.css';

import { AudioSystem, SoundEffectComponent } from './audio';
import { BufferGeometry, Clock, Mesh } from 'three';
import { FollowComponent, FollowSystem } from './follow';
import { GlobalComponent, KTX2_LOADER, gltfLoader } from './global';
import { GrabComponent, GrabSystem } from './grab';
import { PlayerComponent, PlayerSystem } from './player';
import {
	acceleratedRaycast,
	computeBoundsTree,
	disposeBoundsTree,
} from 'three-mesh-bvh';

import { ConfigUISystem } from './configUI';
import { InlineSystem } from './landing';
import { PointerSystem } from './pointer';
import { SizingSystem } from './size';
import { WelcomeSystem } from './welcome';
import { World } from 'elics';
import { loadSneakers } from './sneaker';
import { setupScene } from './scene';

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

const world = new World();
world
	.registerComponent(GlobalComponent)
	.registerComponent(PlayerComponent)
	.registerComponent(SoundEffectComponent)
	.registerComponent(FollowComponent)
	.registerComponent(GrabComponent)
	.registerSystem(PlayerSystem)
	.registerSystem(WelcomeSystem)
	.registerSystem(SizingSystem)
	.registerSystem(InlineSystem)
	.registerSystem(ConfigUISystem)
	.registerSystem(GrabSystem)
	.registerSystem(FollowSystem)
	.registerSystem(AudioSystem)
	.registerSystem(PointerSystem);

const clock = new Clock();

const { scene, camera, renderer } = setupScene();

gltfLoader.setKTX2Loader(KTX2_LOADER.detectSupport(renderer));

const global = world.createEntity().addComponent(GlobalComponent, {
	renderer,
	camera,
	scene,
});

loadSneakers(world, global);

renderer.setAnimationLoop(function () {
	const delta = clock.getDelta();
	const time = clock.elapsedTime;
	world.update(delta, time);
	renderer.render(scene, camera);
});
