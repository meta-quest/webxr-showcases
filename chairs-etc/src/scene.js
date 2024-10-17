/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	DirectionalLight,
	PCFSoftShadowMap,
	PMREMGenerator,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from 'three';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { globals } from './global';
import { reversePainterSortStable } from '@pmndrs/uikit';

export const setupScene = () => {
	const scene = new Scene();

	const camera = new PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		10,
	);

	camera.position.z = 0.2;

	const light = new DirectionalLight(0xffffff);
	light.castShadow = true;
	scene.add(light);

	const renderer = new WebGLRenderer({
		alpha: true,
		antialias: true,
		multiviewStereo: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	renderer.setTransparentSort(reversePainterSortStable);
	renderer.localClippingEnabled = true;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFSoftShadowMap;

	const environment = new RoomEnvironment(renderer);
	const pmremGenerator = new PMREMGenerator(renderer);

	scene.environment = pmremGenerator.fromScene(environment).texture;
	scene.environmentIntensity = 0.2;
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	globals.camera = camera;
	globals.renderer = renderer;
	globals.scene = scene;
};
