/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	DirectionalLight,
	HemisphereLight,
	LoadingManager,
	PMREMGenerator,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	WebGLRenderer,
} from 'three';

import { Constants } from './global';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

const LOADING_MANAGER = new LoadingManager();
const DRACO_LOADER = new DRACOLoader(LOADING_MANAGER).setDecoderPath(
	`vendor/draco/gltf/`,
);
const KTX2_LOADER = new KTX2Loader(LOADING_MANAGER).setTranscoderPath(
	`vendor/basis/`,
);

/**
 * Sets up the main scene, camera, and renderer for the game.
 * @returns {Object} An object containing the scene, camera, and renderer.
 */
export const setupScene = () => {
	const scene = new Scene();

	// Set up the main camera
	const camera = new PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		5000,
	);

	// Add hemisphere light for soft ambient lighting
	scene.add(new HemisphereLight(0x606060, 0x404040));

	// Add directional light for brighter, directional illumination
	const light = new DirectionalLight(0xffffff);
	light.position.set(1, 1, 1).normalize();
	scene.add(light);

	// Set up the WebGL renderer with anti-aliasing
	const renderer = new WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.xr.enabled = true;
	document.body.appendChild(renderer.domElement);

	// Set up the PMREM generator for environment mapping
	const pmremGenerator = new PMREMGenerator(renderer);
	pmremGenerator.compileEquirectangularShader();

	// Load environment map and set it to the scene
	new EXRLoader().load(Constants.ENV_TEXTURE_PATH, (texture) => {
		const envMap = pmremGenerator.fromEquirectangular(texture).texture;
		pmremGenerator.dispose();
		scene.environment = envMap;
	});

	// Load and add the main game model to the scene
	const gltfLoader = new GLTFLoader(LOADING_MANAGER)
		.setCrossOrigin('anonymous')
		.setDRACOLoader(DRACO_LOADER)
		.setKTX2Loader(KTX2_LOADER.detectSupport(renderer));
	gltfLoader.load(Constants.SCENE_MODEL_PATH, (gltf) => {
		scene.add(gltf.scene);
	});

	// Adjust camera and renderer settings on window resize
	window.addEventListener('resize', function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	return { scene, camera, renderer, gltfLoader };
};
