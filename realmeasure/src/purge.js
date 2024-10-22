/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Mesh, MeshBasicMaterial, RingGeometry, Vector3 } from 'three';

import { MeasurementComponent } from './measurement';
import { System } from 'elics';
import { XR_BUTTONS } from 'gamepad-wrapper';
import { globals } from './global';

const PURGE_PRESS_TIME = 3;
const PURGE_RING_MATERIAL = new MeshBasicMaterial();
const PURGE_RING_GEOMETRY = new RingGeometry(0.008, 0.01, 16);
const RING_INNER_RADIUS = 0.006;
const RING_OUTER_RADIUS = 0.0075;
const NUM_SEGMENTS = 32;

export class PurgeSystem extends System {
	init() {
		this._vec3 = new Vector3();
	}

	update(delta) {
		let purging = false;
		const { controllers, playerHead } = globals;
		['left', 'right'].forEach((handedness) => {
			const controller = controllers[handedness];
			if (controller) {
				if (!controller.userData.purgeRing) {
					const geometry = PURGE_RING_GEOMETRY.clone();
					const purgeRing = new Mesh(geometry, PURGE_RING_MATERIAL);
					purgeRing.userData.setValue = (value) => {
						const geometry = new RingGeometry(
							RING_INNER_RADIUS,
							RING_OUTER_RADIUS,
							NUM_SEGMENTS,
							1,
							0,
							Math.PI * 2 * value,
						);
						purgeRing.geometry.dispose();
						purgeRing.geometry = geometry;
					};
					controller.raySpace.add(purgeRing);
					purgeRing.position.set(
						0.0029563651734136748 * (handedness === 'right' ? -1 : 1),
						0.0037325887561946436,
						0.04302602904751607,
					);
					controller.userData.purgeRing = purgeRing;
				}
				const purgeRing = controller.userData.purgeRing;
				if (controller.gamepad?.getButton(XR_BUTTONS.BUTTON_1)) {
					if (!controller.userData.pressedTime) {
						controller.userData.pressedTime = 0;
					}
					controller.userData.pressedTime += delta;
				} else {
					controller.userData.pressedTime = 0;
				}
				if (controller.userData.pressedTime > PURGE_PRESS_TIME) {
					purging = true;
					const hapticActuator = controller.gamepad._gamepad.hapticActuators
						? controller.gamepad._gamepad.hapticActuators[0]
						: null;
					hapticActuator?.pulse(0.8, 100);
					controller.userData.pressedTime = 0;
				}
				purgeRing.visible = controller.userData.pressedTime > 0;
				if (purgeRing.visible) {
					purgeRing.userData.setValue(
						Math.min(controller.userData.pressedTime / PURGE_PRESS_TIME, 1),
					);
					playerHead.getWorldPosition(this._vec3);
					purgeRing.lookAt(this._vec3);
				}
			}
		});
		if (purging) {
			const measurements = this.getEntities(this.queries.measurements);
			measurements.forEach((measurement) => {
				if (
					!(
						measurement.getComponent(MeasurementComponent).attachedGamepads
							?.length > 0
					)
				) {
					measurement.destroy();
				}
			});
		}
	}
}

PurgeSystem.queries = {
	measurements: { required: [MeasurementComponent] },
};
