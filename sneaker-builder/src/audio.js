/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, System } from 'elics';

import { Howl } from 'howler';
import { PlayerComponent } from './player';
import { Vector3 } from 'three';

export class SoundEffectComponent extends Component {}

export class AudioSystem extends System {
	init() {
		this.soundEffects = {
			confirm: new Howl({ src: ['assets/audio/confirm.webm'] }),
			maximize: new Howl({ src: ['assets/audio/maximize.webm'] }),
			minimize: new Howl({ src: ['assets/audio/minimize.webm'] }),
			click: new Howl({ src: ['assets/audio/click.webm'] }),
		};
		this._vec3 = new Vector3();
	}

	update() {
		const player = this.getEntities(this.queries.player)[0].getComponent(
			PlayerComponent,
		);
		this.getEntities(this.queries.soundEffects).forEach((entity) => {
			const soundEffectComponent = entity.getComponent(SoundEffectComponent);
			const soundEffect = this.soundEffects[soundEffectComponent.type];
			const soundInstanceId = soundEffect.play();
			const localPosition = player.head.worldToLocal(
				soundEffectComponent.sourceObject.getWorldPosition(this._vec3),
			);
			soundEffect.pos(...localPosition.toArray(), soundInstanceId);
			soundEffect.volume(1, soundInstanceId);
			entity.destroy();
		});
	}
}

AudioSystem.queries = {
	player: { required: [PlayerComponent] },
	soundEffects: { required: [SoundEffectComponent] },
};
