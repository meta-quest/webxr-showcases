/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GlobalComponent } from './global';
import { System } from 'elics';
import { VRButton } from 'ratk';

/**
 * The InlineSystem class manages the VR and Web launch buttons on the landing page.
 */
export class InlineSystem extends System {
	init() {
		this.needsSetup = true;
	}

	/**
	 * Sets up the VR and Web launch buttons.
	 * @param {Object} global - The global component containing the renderer.
	 */
	_setupButtons(global) {
		const vrButton = document.getElementById('vr-button');
		const webLaunchButton = document.getElementById('web-launch-button');

		// Initially hide the web launch button
		webLaunchButton.style.display = 'none';

		// Convert the VR button and handle unsupported VR scenarios
		VRButton.convertToVRButton(vrButton, global.renderer, {
			optionalFeatures: ['local-floor', 'bounded-floor', 'layers'],
			onUnsupported: () => {
				vrButton.style.display = 'none';
				webLaunchButton.style.display = 'block';
			},
		});

		// Set the action for the web launch button
		webLaunchButton.onclick = () => {
			window.open(
				'https://www.oculus.com/open_url/?url=' +
					encodeURIComponent(window.location.href),
			);
		};
	}

	/**
	 * Executes the system logic. Sets up the buttons if they haven't been set up yet.
	 */
	update() {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);

		if (this.needsSetup) {
			this._setupButtons(global);
			this.needsSetup = false;
			return;
		}
	}
}

InlineSystem.queries = {
	global: { required: [GlobalComponent] },
};
