/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	PMREMGenerator,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	WebGLRenderer,
} from 'three';

import { exrLoader } from './global';

export const setupScene = () => {
	const scene = new Scene();

	const camera = new PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.01,
		5000,
	);

	const renderer = new WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.xr.enabled = true;
	document.getElementById('scene-container').appendChild(renderer.domElement);

	const pmremGenerator = new PMREMGenerator(renderer);
	pmremGenerator.compileEquirectangularShader();

	exrLoader.load('assets/venice_sunset_1k.exr', (texture) => {
		const envMap = pmremGenerator.fromEquirectangular(texture).texture;
		pmremGenerator.dispose();
		scene.environment = envMap;
	});

	const onResize = () => {
		resizeCanvas(
			document.getElementById('scene-container').offsetWidth,
			document.getElementById('scene-container').offsetHeight,
			camera,
			renderer,
		);
	};

	window.addEventListener('resize', onResize);

	window.addEventListener('load', onResize);

	renderer.xr.addEventListener('sessionstart', () => {
		const session = renderer.xr.getSession();
		session.updateTargetFrameRate(72);
	});

	document.getElementById('ar-button').addEventListener('click', () => {
		resizeCanvas(window.innerWidth, window.innerHeight, camera, renderer);
	});

	return { scene, camera, renderer };
};

export const resizeCanvas = (width, height, camera, renderer) => {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
};
