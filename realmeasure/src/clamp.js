/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Object3D, Vector3 } from 'three';

import { MeasurementComponent } from './measurement';
import { System } from 'elics';
import { XR_BUTTONS } from 'gamepad-wrapper';
import { globals } from './global';

export class ClampSystem extends System {
	init() {
		this._vec3 = new Vector3();
		this._vec3Left = new Vector3();
		this._vec3Right = new Vector3();
		this._snapHand = null;
	}

	update() {
		const { valueStore, controllers } = globals;
		if (valueStore.get('mode') === 'Clamp') {
			const leftController = controllers.left;
			const rightController = controllers.right;
			if (
				leftController &&
				rightController &&
				leftController.gamepad &&
				rightController.gamepad
			) {
				const leftPointer = leftController.userData.pointer;
				const rightPointer = rightController.userData.pointer;
				if (!this._measurement) {
					this._measurement = this.world.createEntity();
					this._measurement.addComponent(MeasurementComponent, {
						attachedGamepads: [leftController.gamepad, rightController.gamepad],
						_object: new Object3D(),
					});
				}
				leftPointer.getWorldPosition(this._vec3Left);
				rightPointer.getWorldPosition(this._vec3Right);
				const measurementComponent =
					this._measurement.getComponent(MeasurementComponent);
				this._snapHand = leftController.gamepad.getButton(XR_BUTTONS.SQUEEZE)
					? 'left'
					: rightController.gamepad.getButton(XR_BUTTONS.SQUEEZE)
						? 'right'
						: null;
				if (this._snapHand) {
					const refMarkerPosition =
						this._snapHand === 'left' ? this._vec3Right : this._vec3Left;
					const pointerPosition =
						this._snapHand === 'left' ? this._vec3Left : this._vec3Right;
					this._vec3.subVectors(pointerPosition, refMarkerPosition);
					const horizontalDistance = Math.sqrt(
						Math.pow(this._vec3.x, 2) + Math.pow(this._vec3.z, 2),
					);
					if (horizontalDistance > Math.abs(this._vec3.y)) {
						// snap to horizontal
						pointerPosition.y = refMarkerPosition.y;
					} else {
						// snap to vertical
						pointerPosition.x = refMarkerPosition.x;
						pointerPosition.z = refMarkerPosition.z;
					}
					measurementComponent.snap = true;
				} else {
					measurementComponent.snap = false;
				}
				measurementComponent.position1 = this._vec3Left;
				measurementComponent.position2 = this._vec3Right;

				if (
					leftController.gamepad.getButtonClick(XR_BUTTONS.TRIGGER) ||
					rightController.gamepad.getButtonClick(XR_BUTTONS.TRIGGER)
				) {
					const measurementComponent =
						this._measurement.getComponent(MeasurementComponent);
					measurementComponent.attachedGamepads = [];
					this._measurement = null;
				}

				if (
					leftController.gamepad.getButtonClick(XR_BUTTONS.BUTTON_1) ||
					rightController.gamepad.getButtonClick(XR_BUTTONS.BUTTON_1)
				) {
					this._measurement.destroy();
					this._measurement = null;
				}
			}
		} else {
			if (this._measurement) {
				this._measurement.destroy();
				this._measurement = null;
			}
		}
	}
}
