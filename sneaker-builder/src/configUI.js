/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { POINTER_MODE, PlayerComponent } from './player';

import { FollowComponent } from './follow';
import { GlobalComponent } from './global';
import { SoundEffectComponent } from './audio';
import { System } from 'elics';

export class ConfigUISystem extends System {
	update() {
		const { sneakerLeft, sneakerRight, scene } = this.getEntities(
			this.queries.global,
		)[0].getComponent(GlobalComponent);

		if (!sneakerLeft || !sneakerRight) return;

		const player = this.getEntities(this.queries.player)[0].getComponent(
			PlayerComponent,
		);

		[sneakerLeft, sneakerRight].forEach((sneaker) => {
			const { mesh, uiPlane, grabComponent } = sneaker;
			if (!sneaker.uiPlane.parent) {
				this.world.createEntity().addComponent(FollowComponent, {
					object3D: uiPlane,
					followDistanceThreshold: 0.05,
					positionTarget: mesh,
					lookatTarget: player.head,
				});
				scene.add(uiPlane);
			}

			let hasFreeController = false;
			if (grabComponent.attached) {
				Object.values(player.controllers).forEach((controllerObject) => {
					if (!controllerObject.attached) {
						hasFreeController = true;
						controllerObject.pointerMode = POINTER_MODE.Ray;
						const shoeIntersect = sneaker.getShoeIntersect(
							controllerObject.raycaster,
						);
						if (shoeIntersect) {
							controllerObject.intersectDistance = shoeIntersect.distance;
							if (controllerObject.justStartedSelecting) {
								sneaker.setShoePart(shoeIntersect.partName);
								this.world.createEntity().addComponent(SoundEffectComponent, {
									type: 'click',
									sourceObject: mesh,
								});
								try {
									controllerObject.gamepadWrapper
										.getHapticActuator(0)
										?.pulse(0.1, 50);
								} catch {
									console.warn('no haptic actuator');
								}
							}
						} else {
							const uiIntersect =
								controllerObject.raycaster.intersectObject(uiPlane)[0];
							if (uiIntersect) {
								controllerObject.intersectDistance = uiIntersect.distance;
								sneaker.update(
									uiIntersect.object.userData.material_index,
									controllerObject.justStartedSelecting,
								);
								if (controllerObject.justStartedSelecting) {
									this.world.createEntity().addComponent(SoundEffectComponent, {
										type: 'confirm',
										sourceObject: uiIntersect.object,
									});
									try {
										controllerObject.gamepadWrapper
											.getHapticActuator(0)
											?.pulse(0.2, 100);
									} catch {
										console.warn('no haptic actuator');
									}
								}
							}
						}
					} else {
						controllerObject.pointerMode = POINTER_MODE.Claw;
					}
				});
			}

			uiPlane.visible = grabComponent.attached != null && hasFreeController;
		});
	}
}

ConfigUISystem.queries = {
	global: { required: [GlobalComponent] },
	player: { required: [PlayerComponent] },
};
