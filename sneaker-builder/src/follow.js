/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, System } from 'elics';

import { Vector3 } from 'three';

export class FollowComponent extends Component {}

export class FollowSystem extends System {
	init() {
		this._vec3 = new Vector3();
	}

	update(delta) {
		for (const entity of this.getEntities(this.queries.followers)) {
			const {
				object3D,
				positionTarget,
				lookatTarget,
				followDistanceThreshold,
			} = entity.getComponent(FollowComponent);
			positionTarget.getWorldPosition(this._vec3);
			if (object3D.position.distanceTo(this._vec3) > followDistanceThreshold) {
				object3D.position.lerp(this._vec3, delta);
				lookatTarget.getWorldPosition(this._vec3);
				this._vec3.y = object3D.position.y;
				object3D.lookAt(this._vec3);
			}
		}
	}
}

FollowSystem.queries = {
	followers: { required: [FollowComponent] },
};
