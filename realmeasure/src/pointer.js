/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';

import { System } from 'elics';
import { XR_BUTTONS } from 'gamepad-wrapper';
import { globals } from './global';

export class PointerSystem extends System {
	init() {
		this._leftPointerVec3 = new Vector3();
		this._rightPointerVec3 = new Vector3();
	}

	update() {
		const { controllers, scene } = globals;
		['left', 'right'].forEach((handedness) => {
			const controller = controllers[handedness];
			if (!controller) return;
			if (!controller.userData.pointer) {
				controller.pointerSpace = new Group();
				controller.raySpace.add(controller.pointerSpace);
				controller.pointerSpace.position.set(
					0.0074962213231061225 * (handedness === 'left' ? -1 : 1),
					-0.06522086887323097,
					0.10447758896833176,
				);
				const pointer = new Mesh(
					new SphereGeometry(0.004),
					new MeshBasicMaterial({ transparent: true, opacity: 0.6 }),
				);
				controller.pointerSpace.add(pointer);
				controller.userData.pointer = pointer;
			}
		});

		const leftController = controllers.left;
		const rightController = controllers.right;
		if (leftController && rightController) {
			if (
				leftController.gamepad?.getButtonClick(XR_BUTTONS.BUTTON_2) ||
				rightController.gamepad?.getButtonClick(XR_BUTTONS.BUTTON_2)
			) {
				[leftController, rightController].forEach((controller) => {
					const pointer = controller.userData.pointer;
					scene.attach(pointer);
					leftController.pointerSpace.getWorldPosition(this._leftPointerVec3);
					rightController.pointerSpace.getWorldPosition(this._rightPointerVec3);
					pointer.position.lerpVectors(
						this._leftPointerVec3,
						this._rightPointerVec3,
						0.5,
					);
					controller.pointerSpace.attach(pointer);
				});
			}
		}
	}
}
