/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	RingGeometry,
	SRGBColorSpace,
	TextureLoader,
	Vector3,
} from 'three';
import { POINTER_MODE, PlayerComponent } from './player';

import { GlobalComponent } from './global';
import { GrabComponent } from './grab';
import { SoundEffectComponent } from './audio';
import { System } from 'elics';
import { Text } from 'troika-three-text';

const SHOE_SIZES = {
	4: 22.9,
	4.5: 23.3,
	5: 23.8,
	5.5: 24.8,
	6: 24.8,
	6.5: 25.1,
	7: 25.4,
	7.5: 25.8,
	8: 26,
	8.5: 26.7,
	9: 27.3,
	9.5: 27.7,
	10: 27.9,
	10.5: 28.6,
	11: 29.2,
	11.5: 29.5,
	12: 29.8,
	12.5: 30.1,
	13: 30.5,
	13.5: 30.8,
	14: 31.1,
};

const SIZING_MODE_ACTIVATION_Y_THRESHOLD = 0.5;
const SIZING_PANEL_TEXTURE = new TextureLoader().load(
	'assets/sizing_panel.png',
);
SIZING_PANEL_TEXTURE.colorSpace = SRGBColorSpace;
const SIZING_PANEL_GEOMETRY = new PlaneGeometry(0.1, 0.25);
SIZING_PANEL_GEOMETRY.rotateX(-Math.PI / 2);
const SIZING_PANEL_MATERIAL = new MeshBasicMaterial({
	map: SIZING_PANEL_TEXTURE,
	transparent: true,
});
const DEFAULT_SIZE = 10;

export class SizingSystem extends System {
	init() {
		this._unisexSize = DEFAULT_SIZE;
		this._gender = 'mens';
		this._vec3 = new Vector3();
		this._sizeNeedsUpdate = false;
	}

	update(delta) {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);
		const player = this.getEntities(this.queries.player)[0].getComponent(
			PlayerComponent,
		);

		this._sizeNeedsUpdate = false;

		const genderSetting = document.getElementsByClassName('gender-options')[0];
		const sizeOptions = document.getElementsByClassName('size-options')[0];

		const unisexSize = sizeToUnisexSize(
			Number(sizeOptions.dataset.value),
			genderSetting.dataset.value,
		);

		if (
			genderSetting.dataset.value != this._gender ||
			unisexSize != this._unisexSize
		) {
			this._gender = genderSetting.dataset.value;
			this._unisexSize = unisexSize;
			this._sizeNeedsUpdate = true;
		}

		for (const entity of this.getEntities(this.queries.sneakers)) {
			const grabComponent = entity.getComponent(GrabComponent);
			const object = grabComponent.object3D;
			if (!object.userData.sizingPanel) {
				object.userData.sizingPanel = new Mesh(
					SIZING_PANEL_GEOMETRY,
					SIZING_PANEL_MATERIAL,
				);
				object.userData.sizingPanel.rotateY(-Math.PI / 2);
				object.userData.sizingPanel.position.z = 0.15;
				object.add(object.userData.sizingPanel);
				object.userData.sizingPanel.visible = false;

				const sizeText = new Text();
				object.userData.sizingPanel.add(sizeText);
				if (object.userData.shoeId === 'right') {
					sizeText.scale.x = -1;
				}
				sizeText.text = this._unisexSize.toString();
				sizeText.fontSize = 0.05;
				sizeText.rotateX(-Math.PI / 2);
				sizeText.anchorX = 'center';
				sizeText.anchorY = 'middle';
				sizeText.position.y = 0.001;
				sizeText.color = 0xffffff;
				object.userData.sizingPanel.userData.text = sizeText;
				sizeText.sync();

				const ring = new Mesh(
					new RingGeometry(0.045, 0.05, 32),
					new MeshBasicMaterial({ color: 0xffffff }),
				);
				ring.rotateX(-Math.PI / 2);
				ring.position.y = 0.001;
				object.userData.sizingPanel.add(ring);
				ring.visible = false;
				object.userData.sizingPanel.userData.ring = ring;

				object.userData.originalScale = object.scale.clone();
				const sockliner = object.getObjectByName('sockliner').clone();
				object.getObjectByName('sockliner').parent.add(sockliner);
				sockliner.position.x -= 0.32;
				sockliner.position.y -= 0.028;
				object.userData.sockliner = sockliner;
			}
			object.getWorldPosition(this._vec3);
			if (this._vec3.y < SIZING_MODE_ACTIVATION_Y_THRESHOLD) {
				if (grabComponent.justDetached) {
					object.userData.surfaceTarget = this._vec3.clone();
					object.userData.surfaceTarget.y = 0;
					const quat = object.quaternion.clone();
					player.head.getWorldDirection(this._vec3);
					this._vec3.y = 0;
					object.lookAt(this._vec3.add(object.position));
					object.rotateY(
						(Math.PI / 2) * (object.userData.shoeId === 'left' ? 1 : -1),
					);
					object.userData.quatTarget = object.quaternion.clone();
					object.quaternion.copy(quat);
				}
			} else {
				object.userData.surfaceTarget = null;
			}

			grabComponent.onSurface =
				object.position.y == 0 && object.parent == global.scene;
			object.userData.sizingPanel.visible = grabComponent.onSurface;
			object.userData.sockliner.visible = grabComponent.onSurface;
			object.userData.sizingPanel.userData.ring.visible = false;

			if (
				!grabComponent.onSurface &&
				grabComponent.attached == null &&
				object.userData.surfaceTarget != null
			) {
				if (object.position.y < 0.001) {
					object.position.copy(object.userData.surfaceTarget);
					object.quaternion.copy(object.userData.quatTarget);
				} else {
					object.position.lerp(object.userData.surfaceTarget, delta * 2);
					object.quaternion.slerp(object.userData.quatTarget, delta * 2);
				}
			}

			if (grabComponent.onSurface) {
				Object.values(player.controllers).forEach((controllerObject) => {
					const intersect = controllerObject.raycaster.intersectObject(
						object.userData.sizingPanel,
					)[0];
					if (intersect) {
						controllerObject.pointerMode = POINTER_MODE.Ray;
						controllerObject.intersectDistance = intersect.distance;
						const ring = object.userData.sizingPanel.userData.ring;
						ring.visible = true;
						if (intersect.uv.y > 0.7) {
							if (controllerObject.justStartedSelecting) {
								const newSize = this._unisexSize + 0.5;
								if (SHOE_SIZES[newSize]) {
									sizeOptions.dataset.value = unisexSizeToSize(
										newSize,
										this._gender,
									);
									this._unisexSize = newSize;
									this._sizeNeedsUpdate = true;
									this.world.createEntity().addComponent(SoundEffectComponent, {
										type: 'maximize',
										sourceObject: ring,
									});
									try {
										controllerObject.gamepadWrapper
											.getHapticActuator(0)
											?.pulse(0.1, 50);
									} catch {
										console.warn('no haptic actuator');
									}
								}
							}
							ring.position.z = -0.075;
						} else if (intersect.uv.y < 0.3) {
							if (controllerObject.justStartedSelecting) {
								const newSize = this._unisexSize - 0.5;
								if (SHOE_SIZES[newSize]) {
									sizeOptions.dataset.value = unisexSizeToSize(
										newSize,
										this._gender,
									);
									this._unisexSize = newSize;
									this._sizeNeedsUpdate = true;
									this.world.createEntity().addComponent(SoundEffectComponent, {
										type: 'minimize',
										sourceObject: ring,
									});
									try {
										controllerObject.gamepadWrapper
											.getHapticActuator(0)
											?.pulse(0.1, 50);
									} catch {
										console.warn('no haptic actuator');
									}
								}
							}
							ring.position.z = 0.075;
						}
					}
				});
			}
		}

		if (this._sizeNeedsUpdate) {
			for (const entity of this.getEntities(this.queries.sneakers)) {
				const grabComponent = entity.getComponent(GrabComponent);
				const object = grabComponent.object3D;
				object.children[0].scale.setScalar(
					SHOE_SIZES[this._unisexSize] / SHOE_SIZES[DEFAULT_SIZE],
				);
				const sizeText = object.userData.sizingPanel.userData.text;
				sizeText.text = unisexSizeToSize(
					this._unisexSize,
					this._gender,
				).toString();
				sizeText.sync();
			}
		}
	}
}

SizingSystem.queries = {
	global: { required: [GlobalComponent] },
	player: { required: [PlayerComponent] },
	sneakers: { required: [GrabComponent] },
};

const sizeToUnisexSize = (size, gender) => {
	return gender == 'mens' ? size : size - 1.5;
};

const unisexSizeToSize = (unisexSize, gender) => {
	return gender == 'mens' ? unisexSize : unisexSize + 1.5;
};
