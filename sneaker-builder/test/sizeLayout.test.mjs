/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	SIZING_PANEL_OFFSET_Z,
	SIZING_PANEL_WIDTH,
	getSurfaceRotationY,
} from '../src/sizeLayout.mjs';

function getPanelWorldX(shoeWorldX, shoeId) {
	return (
		shoeWorldX + Math.sin(getSurfaceRotationY(shoeId)) * SIZING_PANEL_OFFSET_Z
	);
}

test('surface sizing panels face away from adjacent shoes', () => {
	const leftShoeWorldX = -0.05;
	const rightShoeWorldX = 0.05;
	const leftPanelWorldX = getPanelWorldX(leftShoeWorldX, 'left');
	const rightPanelWorldX = getPanelWorldX(rightShoeWorldX, 'right');

	assert.ok(leftPanelWorldX < leftShoeWorldX);
	assert.ok(rightPanelWorldX > rightShoeWorldX);
	assert.ok(rightPanelWorldX - leftPanelWorldX > SIZING_PANEL_WIDTH);
});
