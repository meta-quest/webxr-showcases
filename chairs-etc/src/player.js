/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Group, Matrix4, Vector3 } from 'three';

import { GamepadWrapper } from 'gamepad-wrapper';
import { System } from 'elics';
import { globals } from './global';

/**
 * PlayerSystem manages the player's interactions and updates in the game.
 */
export class PlayerSystem extends System {
	init() {
		this._vec3 = new Vector3();

		const { renderer, camera, scene } = globals;
		const controllers = {};
		scene.add(camera);

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
				scene.add(targetRaySpace, controllerGrip);
			});
			targetRaySpace.addEventListener('disconnected', function () {
				delete controllers[this.handedness];
			});
			scene.add(targetRaySpace);
		}

		const playerHead = new Group();
		scene.add(playerHead);
		globals.playerHead = playerHead;
		globals.controllers = controllers;
	}

	update() {
		Object.values(globals.controllers).forEach((controllerObject) => {
			if (controllerObject) controllerObject.gamepadWrapper.update();
		});
		const xrManager = globals.renderer.xr;
		const frame = xrManager.getFrame();
		const pose = frame?.getViewerPose(xrManager.getReferenceSpace());
		if (pose) {
			const headsetMatrix = new Matrix4().fromArray(
				pose.views[0].transform.matrix,
			);
			headsetMatrix.decompose(
				globals.playerHead.position,
				globals.playerHead.quaternion,
				this._vec3,
			);
		}
	}
}
