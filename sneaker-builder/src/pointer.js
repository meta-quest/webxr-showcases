/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	Mesh,
	MeshBasicMaterial,
	MeshMatcapMaterial,
	SphereGeometry,
	TextureLoader,
} from 'three';
import { POINTER_MODE, PlayerComponent } from './player';

import { System } from 'elics';
import { gltfLoader } from './global';

const POINTER_MATERIAL = new MeshMatcapMaterial({
	matcap: new TextureLoader().load('assets/matcap.png'),
});

export class PointerSystem extends System {
	update(delta) {
		const player = this.getEntities(this.queries.player)[0].getComponent(
			PlayerComponent,
		);
		Object.values(player.controllers).forEach((controllerObject) => {
			const { targetRaySpace } = controllerObject;
			if (!targetRaySpace.userData.pointer) {
				const cursor = new Mesh(
					new SphereGeometry(0.005, 32, 16),
					new MeshBasicMaterial({ transparent: true, opacity: 0.2 }),
				);
				cursor.renderOrder = 999;
				targetRaySpace.userData.pointer = {
					object: null,
					cursor: cursor,
					_clawAlpha: 0,
					_rayAlpha: 1,
				};
				targetRaySpace.add(cursor);
				cursor.visible = false;
				gltfLoader.load('assets/pointer.glb', (gltf) => {
					const pointerObject = gltf.scene;
					targetRaySpace.add(pointerObject);
					pointerObject.position.z = -0.01;
					targetRaySpace.userData.pointer.object = pointerObject;
					pointerObject.traverse((child) => {
						if (child.isMesh) {
							child.material = POINTER_MATERIAL;
						}
					});
					const ptr1 = pointerObject.getObjectByName('ptr1');
					const ptr2 = pointerObject.getObjectByName('ptr2');
					const ptr3 = pointerObject.getObjectByName('ptr3');
					const ptr4 = pointerObject.getObjectByName('ptr4');
					ptr1.userData.closeQuat = ptr1.quaternion.clone();
					ptr2.userData.closeQuat = ptr2.quaternion.clone();
					ptr3.userData.closeQuat = ptr3.quaternion.clone();
					ptr4.userData.closeQuat = ptr4.quaternion.clone();
					ptr1.rotateX(-Math.PI / 4);
					ptr2.rotateY(Math.PI / 4);
					ptr3.rotateX(Math.PI / 4);
					ptr4.rotateY(-Math.PI / 4);
					ptr1.userData.openQuat = ptr1.quaternion.clone();
					ptr2.userData.openQuat = ptr2.quaternion.clone();
					ptr3.userData.openQuat = ptr3.quaternion.clone();
					ptr4.userData.openQuat = ptr4.quaternion.clone();
				});
			}

			const pointer = targetRaySpace.userData.pointer;
			pointer.cursor.visible = false;
			if (pointer.object) {
				const alpha = delta * 50;
				if (controllerObject.pointerMode === POINTER_MODE.Claw) {
					const triggerValue = controllerObject.gamepad.buttons[0].value;
					pointer._clawAlpha = lerp(pointer._clawAlpha, triggerValue, alpha);
					pointer._rayAlpha = lerp(pointer._rayAlpha, 1, alpha);
				} else {
					pointer._clawAlpha = lerp(pointer._clawAlpha, 1, alpha);
					pointer._rayAlpha = lerp(pointer._rayAlpha, 3, alpha);
					if (controllerObject.intersectDistance) {
						pointer.cursor.visible = true;
						pointer.cursor.position.z = -controllerObject.intersectDistance;
					}
				}

				pointer.object.children.forEach((ptr) => {
					ptr.quaternion.slerpQuaternions(
						ptr.userData.openQuat,
						ptr.userData.closeQuat,
						pointer._clawAlpha,
					);
					ptr.scale.z = pointer._rayAlpha;
				});
			}
		});
	}
}

PointerSystem.queries = {
	player: { required: [PlayerComponent] },
};

const lerp = function (value1, value2, alpha) {
	alpha = Math.max(Math.min(alpha, 1), 0);
	return value1 + (value2 - value1) * alpha;
};
