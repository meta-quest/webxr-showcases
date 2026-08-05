/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SIZING_PANEL_WIDTH = 0.1;
export const SIZING_PANEL_OFFSET_Z = -0.15;

export function getSurfaceRotationY(shoeId) {
	return (Math.PI / 2) * (shoeId === 'left' ? 1 : -1);
}
