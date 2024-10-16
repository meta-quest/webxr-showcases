/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, System } from 'elics';
import { DoubleSide, Group, Matrix4, Raycaster, Vector3 } from 'three';

import { GamepadWrapper } from 'gamepad-wrapper';
import { GlobalComponent } from './global';
import { ShaderMaterial } from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

export const POINTER_MODE = {
	Claw: 'claw',
	Ray: 'ray',
};

export class PlayerComponent extends Component {}

const maskMaterial = new ShaderMaterial({
	vertexShader: `
  void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
  
      gl_Position = projectedPosition;
  }
  `,
	fragmentShader: `
  void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
  `,
	side: DoubleSide,
});

export class PlayerSystem extends System {
	init() {
		this._vec3 = new Vector3();
		this._vec32 = new Vector3();
	}

	_setup(global) {
		const { renderer, camera, scene } = global;
		const controllers = {};
		const playerSpace = new Group();
		playerSpace.add(camera);

		for (let i = 0; i < 2; i++) {
			const controllerModelFactory = new XRControllerModelFactory();
			const controllerGrip = renderer.xr.getControllerGrip(i);
			const controllerModel =
				controllerModelFactory.createControllerModel(controllerGrip);
			controllerModel.userData = { needsUpdate: true };
			controllerGrip.add(controllerModel);
			scene.add(controllerGrip);
			const targetRaySpace = renderer.xr.getController(i);
			targetRaySpace.addEventListener('connected', async function (event) {
				this.handedness = event.data.handedness;
				const gamepadWrapper = new GamepadWrapper(event.data.gamepad);
				const raycaster = new Raycaster();
				raycaster.firstHitOnly = true;
				controllers[event.data.handedness] = {
					handedness: event.data.handedness,
					targetRaySpace: targetRaySpace,
					gripSpace: controllerGrip,
					gamepadWrapper: gamepadWrapper,
					gamepad: event.data.gamepad,
					pointerMode: POINTER_MODE.Claw,
					intersectDistance: null,
					raycaster: raycaster,
					isSelecting: false,
					_prevSelecting: false,
					justStartedSelecting: false,
					justStoppedSelecting: false,
					attached: false,
					controllerModel: controllerModel,
				};
				playerSpace.add(targetRaySpace, controllerGrip);
			});
			targetRaySpace.addEventListener('disconnected', function () {
				delete controllers[this.handedness];
			});
			targetRaySpace.addEventListener('selectstart', function () {
				controllers[this.handedness].isSelecting = true;
			});
			targetRaySpace.addEventListener('selectend', function () {
				controllers[this.handedness].isSelecting = false;
			});
			// addTargetRay(targetRaySpace);
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
				if (controllerObject) {
					controllerObject.gamepadWrapper.update();
					controllerObject.justStartedSelecting =
						controllerObject.isSelecting && !controllerObject._prevSelecting;
					controllerObject.justStoppedSelecting =
						!controllerObject.isSelecting && controllerObject._prevSelecting;
					controllerObject._prevSelecting = controllerObject.isSelecting;
					controllerObject.raycaster.set(
						controllerObject.targetRaySpace.getWorldPosition(this._vec3),
						controllerObject.targetRaySpace
							.getWorldDirection(this._vec32)
							.negate(),
					);
					controllerObject.pointerMode = POINTER_MODE.Claw;
					controllerObject.intersectDistance = null;

					if (
						controllerObject.controllerModel.children.length > 0 &&
						controllerObject.controllerModel.userData.needsUpdate
					) {
						controllerObject.controllerModel.traverse((child) => {
							if (child.isMesh) {
								child.material = maskMaterial;
							}
						});
						controllerObject.controllerModel.userData.needsUpdate = false;
					}
				}
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
