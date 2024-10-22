/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './styles/index.css';

import { ARButton, RealityAccelerator } from 'ratk';
import { MeasurementComponent, MeasurementSystem } from './measurement';

import { ClampSystem } from './clamp';
import { Clock } from 'three';
import { PlayerSystem } from './player';
import { PointerSystem } from './pointer';
import { PurgeSystem } from './purge';
import { SettingsSystem } from './settings';
import { TapeSystem } from './tape';
import { World } from 'elics';
import { globals } from './global';
import { setupScene } from './scene';

const world = new World();
setupScene();
const ratk = new RealityAccelerator(globals.renderer.xr);
ratk.onPlaneAdded = (plane) => {
	plane.visible = false;
};
ratk.onMeshAdded = (mesh) => {
	mesh.visible = false;
};
globals.ratk = ratk;
globals.scene.add(ratk.root);

world
	.registerComponent(MeasurementComponent)
	.registerSystem(PlayerSystem)
	.registerSystem(SettingsSystem)
	.registerSystem(PointerSystem)
	.registerSystem(ClampSystem)
	.registerSystem(TapeSystem)
	.registerSystem(PurgeSystem)
	.registerSystem(MeasurementSystem);

const { renderer } = globals;
renderer.xr.setFramebufferScaleFactor(2);
renderer.xr.addEventListener('sessionstart', () => {
	renderer.xr.setFoveation(0);
});

const mrButton = document.getElementById('mr-button');
const webLaunchButton = document.getElementById('web-launch-button');

// Initially hide the web launch button
webLaunchButton.style.display = 'none';

// Convert the VR button and handle unsupported VR scenarios
ARButton.convertToARButton(mrButton, renderer, {
	optionalFeatures: ['local-floor', 'layers', 'anchors', 'unbounded'],
	onUnsupported: () => {
		mrButton.style.display = 'none';
		webLaunchButton.style.display = 'block';
	},
	onSupported: () => {
		mrButton.innerHTML = 'Launch';
	},
});

// Set the action for the web launch button
webLaunchButton.onclick = () => {
	window.open(
		'https://www.oculus.com/open_url/?url=' +
			encodeURIComponent(window.location.href),
	);
};

const clock = new Clock();
globals.renderer.setAnimationLoop(function () {
	ratk.update();
	world.update(clock.getDelta(), clock.getElapsedTime());
	globals.renderer.render(globals.scene, globals.camera);
});
