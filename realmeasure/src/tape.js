/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MeasurementComponent } from './measurement';
import { Object3D } from 'three';
import { System } from 'elics';
import { Vector3 } from 'three';
import { XR_BUTTONS } from 'gamepad-wrapper';
import { globals } from './global';

export class TapeSystem extends System {
	init() {
		this._vec3 = new Vector3();
	}

	update() {
		const { valueStore, controllers } = globals;
		if (valueStore.get('mode') === 'Tape') {
			['left', 'right'].forEach((handedness) => {
				const controller = controllers[handedness];
				if (!controller) return;

				const { userData, gamepad } = controller;

				if (!gamepad) return;

				if (gamepad.getButtonClick(XR_BUTTONS.TRIGGER)) {
					if (userData.attachedMeasurement) {
						const measurementComponent =
							userData.attachedMeasurement.getComponent(MeasurementComponent);
						measurementComponent.attachedGamepads = [];
						userData.attachedMeasurement = null;
					} else {
						const position = userData.pointer.getWorldPosition(new Vector3());
						const measurement = this.world.createEntity();
						measurement.addComponent(MeasurementComponent, {
							position1: position,
							position2: position,
							attachedGamepads: [gamepad],
							_object: new Object3D(),
						});
						userData.attachedMeasurement = measurement;
					}
				}

				if (userData.attachedMeasurement) {
					if (gamepad.getButton(XR_BUTTONS.BUTTON_1)) {
						userData.attachedMeasurement.destroy();
						userData.attachedMeasurement = null;
					} else {
						const pointerPosition = userData.pointer.getWorldPosition(
							new Vector3(),
						);
						const measurementComponent =
							userData.attachedMeasurement.getComponent(MeasurementComponent);
						if (
							gamepad.getButton(XR_BUTTONS.SQUEEZE) &&
							measurementComponent.marker1
						) {
							measurementComponent.snap = true;
							const marker1Position = measurementComponent.marker1.position;
							this._vec3.subVectors(pointerPosition, marker1Position);
							const horizontalDistance = Math.sqrt(
								Math.pow(this._vec3.x, 2) + Math.pow(this._vec3.z, 2),
							);
							if (horizontalDistance > Math.abs(this._vec3.y)) {
								// snap to horizontal
								pointerPosition.y = marker1Position.y;
							} else {
								// snap to vertical
								pointerPosition.x = marker1Position.x;
								pointerPosition.z = marker1Position.z;
							}
						} else {
							measurementComponent.snap = false;
						}
						measurementComponent.position2 = pointerPosition;
					}
				}
			});
		} else {
			['left', 'right'].forEach((handedness) => {
				const controller = controllers[handedness];
				if (controller?.userData.attachedMeasurement) {
					controller.userData.attachedMeasurement.destroy();
					controller.userData.attachedMeasurement = null;
				}
			});
		}
	}
}
