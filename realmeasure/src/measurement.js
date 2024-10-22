/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, System } from 'elics';
import {
	CylinderGeometry,
	Mesh,
	MeshBasicMaterial,
	Quaternion,
	SphereGeometry,
	Vector3,
} from 'three';

import { Text } from 'troika-three-text';
import { globals } from './global';

const MARKER_GEOMETRY = new SphereGeometry(0.004);
const LINE_GEOMETRY = new CylinderGeometry(0.002, 0.002, 1).rotateX(
	Math.PI / 2,
);
const MEASUREMENT_MATERIAL = new MeshBasicMaterial({
	transparent: true,
	opacity: 0.6,
});

export class MeasurementComponent extends Component {
	reset() {
		this.marker1 = null;
		this.marker2 = null;
		this.line = null;
		this.text = null;
		this.material = null;
		this.position1 = null;
		this.position2 = null;
		this.attachedGamepads = null;
		this.snap = false;
		this._object.removeFromParent();
	}
}

export class MeasurementSystem extends System {
	init() {
		this._vec3 = new Vector3();
		const { renderer } = globals;
		renderer.xr.addEventListener('sessionstart', () => {
			this._justEnteredXR = true;
		});
	}

	update() {
		const { ratk, valueStore, scene, playerHead } = globals;
		ratk.update();
		if (this._justEnteredXR) {
			ratk.createAnchor(new Vector3(), new Quaternion()).then((anchor) => {
				this._anchor = anchor;
			});
		}
		this._justEnteredXR = false;
		if (!this._anchor) return;
		const measurements = this.getEntities(this.queries.measurements);
		measurements.forEach((measurement) => {
			const measurementComponent =
				measurement.getComponent(MeasurementComponent);
			if (!measurementComponent.marker1) {
				// initialize the measurement object
				const material = MEASUREMENT_MATERIAL.clone();
				measurementComponent.marker1 = new Mesh(MARKER_GEOMETRY, material);
				measurementComponent.marker2 = new Mesh(MARKER_GEOMETRY, material);
				measurementComponent.line = new Mesh(LINE_GEOMETRY, material);
				measurementComponent.marker1.renderOrder = 1;
				measurementComponent.marker2.renderOrder = 1;
				measurementComponent.line.renderOrder = 2;
				measurementComponent.material = material;
				measurementComponent.text = new Text();
				measurementComponent.text.text = '--';
				measurementComponent.text.fontSize = 0.02;
				measurementComponent.text.anchorX = 'center';
				measurementComponent.text.anchorY = 'middle';
				measurementComponent.text.sync();
				measurementComponent.text.material.depthTest = false;
				measurementComponent.text.renderOrder = 999;
				measurementComponent._object.add(
					measurementComponent.marker1,
					measurementComponent.marker2,
					measurementComponent.line,
					measurementComponent.text,
				);
				this._anchor.attach(measurementComponent._object);
			}

			const {
				position1,
				position2,
				marker1,
				marker2,
				text,
				line,
				material,
				needsUpdate,
				attachedGamepads,
				_object,
			} = measurementComponent;
			const lineNeedsUpdate = position1 || position2 || needsUpdate;
			const prevPointerDistance = marker1.position.distanceTo(marker2.position);
			if (position1) {
				scene.add(marker1);
				marker1.position.copy(position1);
				_object.attach(marker1);
				measurementComponent.position1 = null;
			}
			if (position2) {
				scene.add(marker2);
				marker2.position.copy(position2);
				_object.attach(marker2);
				measurementComponent.position2 = null;
			}
			if (lineNeedsUpdate) {
				const pointerDistance = marker1.position.distanceTo(marker2.position);
				line.position.lerpVectors(marker1.position, marker2.position, 0.5);
				marker2.getWorldPosition(this._vec3);
				line.lookAt(this._vec3);
				line.scale.set(1, 1, pointerDistance);
				text.position.copy(line.position);
				text.position.y += 0.01;
				const unit = valueStore.get('unit');
				let displayText;
				if (unit === 'Metric') {
					displayText = (pointerDistance * 100).toFixed(1) + ' cm';
				} else {
					displayText = ((pointerDistance * 100) / 2.54).toFixed(1) + ' in';
				}
				if (displayText !== text.text) {
					text.text = displayText;
					text.sync();
				}
				material.color.setHex(measurementComponent.snap ? 0x45bd63 : 0xffffff);
				if (attachedGamepads?.length > 0) {
					if (
						Math.floor(prevPointerDistance * 100) !=
						Math.floor(pointerDistance * 100)
					) {
						attachedGamepads.forEach((gamepad) => {
							const hapticActuator = gamepad._gamepad.hapticActuators
								? gamepad._gamepad.hapticActuators[0]
								: null;
							hapticActuator?.pulse(0.1, 10);
						});
					}
				}
			}
			text.lookAt(playerHead.position);
		});
	}
}

MeasurementSystem.queries = {
	measurements: { required: [MeasurementComponent] },
};
