/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GlobalComponent, textureLoader } from './global';
import {
	Group,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PlaneGeometry,
	SRGBColorSpace,
} from 'three';

import { FollowComponent } from './follow';
import { PlayerComponent } from './player';
import { System } from 'elics';

export class WelcomeSystem extends System {
	init() {
		this._welcomePanel = null;
		this._sneakerObjects = {
			left: null,
			right: null,
		};

		this._sneakersGroup = null;
		this._sneakersDetached = false;
	}

	update() {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);

		const player = this.getEntities(this.queries.player)[0].getComponent(
			PlayerComponent,
		);

		const { sneakerLeft, sneakerRight } = global;

		if (!this._welcomePanel && sneakerLeft && sneakerRight) {
			const geometry = new PlaneGeometry(0.5, 0.12);
			const material = new MeshBasicMaterial({
				transparent: true,
			});
			textureLoader.load('assets/intro_panel.png', (texture) => {
				texture.colorSpace = SRGBColorSpace;
				material.map = texture;
			});
			const plane = new Mesh(geometry, material);
			this._welcomePanel = plane;
			global.scene.add(this._welcomePanel);
			const uiAnchor = new Object3D();
			uiAnchor.position.set(0, 0, -0.5);
			player.head.add(uiAnchor);

			this.world.createEntity().addComponent(FollowComponent, {
				object3D: this._welcomePanel,
				followDistanceThreshold: 0.1,
				positionTarget: uiAnchor,
				lookatTarget: player.head,
			});
			console.log(this._welcomePanel);

			sneakerLeft.mesh.position.set(-0.025, 0.039, -0.061);
			sneakerRight.mesh.position.set(-0.025, 0.039, 0.061);

			const sneakers = new Group().add(sneakerLeft.mesh, sneakerRight.mesh);
			sneakers.position.y = -0.25;
			this._welcomePanel.add(sneakers);
			this._sneakersGroup = sneakers;
		}

		if (this._welcomePanel) {
			let isAttached = false;
			Object.values(player.controllers).forEach((controllerObject) => {
				if (controllerObject.attached) {
					isAttached = true;
				}
			});
			if (isAttached && !this._sneakersDetached) {
				[...this._sneakersGroup.children].forEach((sneakerObject) => {
					global.scene.attach(sneakerObject);
				});
				this._sneakersDetached = true;
			}
			this._welcomePanel.visible =
				global.renderer.xr.isPresenting && !isAttached;
		}
	}
}

WelcomeSystem.queries = {
	global: { required: [GlobalComponent] },
	player: { required: [PlayerComponent] },
};
