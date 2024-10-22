/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	FrontSide,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PlaneGeometry,
	SRGBColorSpace,
	Vector3,
} from 'three';
import { XR_AXES, XR_BUTTONS } from 'gamepad-wrapper';

import { System } from 'elics';
import { Text } from 'troika-three-text';
import { globals } from './global';

const SETTING_ENTRIES = {
	unit: { position: [0, 0.01, 0.001], options: ['Metric', 'Imperial'] },
	mode: { position: [0, -0.1775, 0.001], options: ['Tape', 'Clamp'] },
	tips: { position: [0, -0.365, 0.001], options: ['On', 'Off'] },
};

const DIRECTIONS = {
	Up: 'up',
	Down: 'down',
	Left: 'left',
	Right: 'right',
	None: 'none',
};

export class SettingsSystem extends System {
	init() {
		this._vec3 = new Vector3();
		this._targetVec3 = new Vector3();

		Object.entries(SETTING_ENTRIES).forEach(([key, config]) => {
			globals.valueStore.set(key, config.options[0]);
		});
	}

	update(delta) {
		if (!this._settingsPanel) {
			const settingsTexture = globals.textureLoader.load('assets/settings.png');
			settingsTexture.colorSpace = SRGBColorSpace;
			this._settingsPanel = new Mesh(
				new PlaneGeometry(1, 1),
				new MeshBasicMaterial({
					map: settingsTexture,
					side: FrontSide,
					transparent: true,
				}),
			);
			globals.scene.add(this._settingsPanel);
			this._settingsTexts = {};
			Object.entries(SETTING_ENTRIES).forEach(([key, config]) => {
				const text = new Text();
				text.text = globals.valueStore.get(key);
				text.fontSize = 0.06;
				text.anchorX = 'center';
				text.anchorY = 'middle';
				text.sync();
				this._settingsPanel.add(text);
				text.position.fromArray(config.position);
				text.position.y -= 0.02;
				this._settingsTexts[key] = text;
			});
			this._currentSetting = Object.keys(SETTING_ENTRIES)[0];
			globals.gltfLoader.load('assets/circle.glb', (gltf) => {
				const outlineCircle = gltf.scene.children[0];
				outlineCircle.material = new MeshBasicMaterial({
					side: FrontSide,
				});
				this._settingsPanel.add(outlineCircle);
				outlineCircle.position.fromArray(
					SETTING_ENTRIES[this._currentSetting].position,
				);
				this._outlineCircle = outlineCircle;
			});
			this._settingsPanel.scale.setScalar(0.6);
			this._target = new Object3D();
			globals.playerHead.add(this._target);
			this._target.position.set(0, 0, -1);
		}

		['left', 'right'].forEach((handedness) => {
			const controller = globals.controllers[handedness];
			if (!controller) return;

			if (!controller.userData.controlsPanel) {
				const controlsTexture = globals.textureLoader.load(
					`assets/controls-${handedness}.png`,
				);
				controlsTexture.colorSpace = SRGBColorSpace;
				const controlsPanel = new Mesh(
					new PlaneGeometry(0.15, 0.1),
					new MeshBasicMaterial({
						map: controlsTexture,
						side: FrontSide,
						transparent: true,
					}),
				);
				controller.raySpace.add(controlsPanel);
				controlsPanel.position.set(0, 0.05, -0.05);
				controller.userData.controlsPanel = controlsPanel;
			}
			if (globals.valueStore.get('tips') === 'On') {
				controller.userData.controlsPanel.visible = true;
				globals.playerHead.getWorldPosition(this._vec3);
				controller.userData.controlsPanel.lookAt(this._vec3);
			} else {
				controller.userData.controlsPanel.visible = false;
			}
		});

		globals.renderer.xr.addEventListener('sessionstart', () => {
			this._syncTransform();
		});

		const leftGamepad = globals.controllers.left?.gamepad;
		const rightGamepad = globals.controllers.right?.gamepad;

		if (
			leftGamepad?.getButtonClick(XR_BUTTONS.THUMBSTICK) ||
			rightGamepad?.getButtonClick(XR_BUTTONS.THUMBSTICK)
		) {
			this._settingsPanel.visible = !this._settingsPanel.visible;
			if (this._settingsPanel.visible) {
				this._syncTransform();
			}
		}

		globals.playerHead.getWorldPosition(this._vec3);
		this._target.getWorldPosition(this._targetVec3);
		this._targetVec3.y = 0;
		if (this._targetVec3.length() > 0) {
			this._targetVec3.normalize();
			this._targetVec3.y = this._vec3.y;
			const distance = this._settingsPanel.position.distanceTo(
				this._targetVec3,
			);
			if (distance > 0.05) {
				this._settingsPanel.position.lerp(this._targetVec3, delta * 2);
				this._vec3.y = this._settingsPanel.position.y;
				this._settingsPanel.lookAt(this._vec3);
			}
		}

		if (!this._settingsPanel.visible) return;

		const gamepad = rightGamepad?.get2DInputValue(XR_BUTTONS.THUMBSTICK)
			? rightGamepad
			: leftGamepad;

		if (gamepad?.get2DInputValue(XR_BUTTONS.THUMBSTICK) > 0.7) {
			const angle = gamepad.get2DInputAngle(XR_BUTTONS.THUMBSTICK);
			let direction = DIRECTIONS.None;
			if (Math.abs(angle) < Math.PI / 6) {
				direction = DIRECTIONS.Up;
			} else if (Math.abs(angle) > (Math.PI / 6) * 5) {
				direction = DIRECTIONS.Down;
			} else if (
				Math.abs(angle) > Math.PI / 3 &&
				Math.abs(angle) < (Math.PI / 3) * 2
			) {
				if (angle > 0) {
					direction = DIRECTIONS.Right;
				} else {
					direction = DIRECTIONS.Left;
				}
			}
			if (direction !== DIRECTIONS.None && direction !== this._prevDirection) {
				const hapticActuator = gamepad._gamepad.hapticActuators
					? gamepad._gamepad.hapticActuators[0]
					: null;
				if (direction === DIRECTIONS.Up || direction === DIRECTIONS.Down) {
					const settingEntryIdx = Object.keys(SETTING_ENTRIES).indexOf(
						this._currentSetting,
					);
					const newEntryIdx =
						(direction === DIRECTIONS.Up
							? settingEntryIdx - 1 + Object.keys(SETTING_ENTRIES).length
							: settingEntryIdx + 1) % Object.keys(SETTING_ENTRIES).length;
					this._currentSetting = Object.keys(SETTING_ENTRIES)[newEntryIdx];
					hapticActuator?.pulse(0.2, 100);
				} else {
					const settingOptions = SETTING_ENTRIES[this._currentSetting].options;
					const optionIdx = settingOptions.indexOf(
						globals.valueStore.get(this._currentSetting),
					);
					const newOptionIdx =
						(direction === DIRECTIONS.Left
							? optionIdx - 1 + settingOptions.length
							: optionIdx + 1) % settingOptions.length;
					const newOption = settingOptions[newOptionIdx];
					globals.valueStore.set(this._currentSetting, newOption);
					this._settingsTexts[this._currentSetting].text = newOption;
					this._settingsTexts[this._currentSetting].sync();
					hapticActuator?.pulse(0.3, 50);
				}
			}
			this._prevDirection = direction;
		} else {
			this._prevDirection = DIRECTIONS.None;
		}

		let x = gamepad?.getAxis(XR_AXES.THUMBSTICK_X) ?? 0;
		let y = gamepad?.getAxis(XR_AXES.THUMBSTICK_Y) ?? 0;
		if (this._outlineCircle) {
			this._outlineCircle.position.fromArray(
				SETTING_ENTRIES[this._currentSetting].position,
			);
			this._outlineCircle.position.x += x * 0.01;
			this._outlineCircle.position.y -= y * 0.01;
		}
	}

	_syncTransform() {
		this._target.getWorldPosition(this._settingsPanel.position);
		globals.playerHead.getWorldPosition(this._vec3);
		this._vec3.y = this._settingsPanel.position.y;
		this._settingsPanel.lookAt(this._vec3);
	}
}
