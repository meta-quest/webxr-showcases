/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './styles/index.css';

import { ARButton, RealityAccelerator } from 'ratk';

import { Clock } from 'three';
import { FurnitureSystem } from './furniture';
import { PlayerSystem } from './player';
import { UIPanelSystem } from './panel';
import { World } from 'elics';
import { globals } from './global';
import { setupScene } from './scene';

const world = new World();
setupScene();
const ratk = new RealityAccelerator(globals.renderer.xr);

globals.renderer.xr.addEventListener('sessionstart', () => {
	setTimeout(() => {
		if (ratk.planes.size == 0) {
			globals.renderer.xr.getSession().initiateRoomCapture();
		}
	}, 5000);
});

globals.ratk = ratk;
globals.scene.add(ratk.root);

world
	.registerSystem(PlayerSystem)
	.registerSystem(FurnitureSystem)
	.registerSystem(UIPanelSystem);

const arButton = document.getElementById('ar-button');
const webLaunchButton = document.getElementById('web-launch-button');
webLaunchButton.style.display = 'none';
ARButton.convertToARButton(arButton, globals.renderer, {
	requiredFeatures: ['hit-test', 'plane-detection', 'anchors'],
	optionalFeatures: ['local-floor', 'bounded-floor', 'layers'],
	onUnsupported: () => {
		arButton.style.display = 'none';
		webLaunchButton.style.display = 'block';
	},
});
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

globals.renderer.xr.addEventListener('sessionstart', () => {
	const session = globals.renderer.xr.getSession();
	console.log(session);
	session.updateTargetFrameRate(72);
});

const url =
	'https://frnaxcssgj.execute-api.us-east-1.amazonaws.com/production/list';

const headers = {
	Accept: '*/*',
	'x-api-key': 'mjQsVgIl_jGLntF=_sTMKECUt-1d6zpX',
};

fetch(url, {
	method: 'GET',
	headers: headers,
})
	.then((response) => response.json())
	.then((data) => console.log(data))
	.catch((error) => console.error('Error:', error));
