/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Container, Image, Root, Text } from '@pmndrs/uikit';
import { Group, Raycaster } from 'three';

import { System } from 'elics';
import { XR_BUTTONS } from 'gamepad-wrapper';
import chairs from './search.json';
import { globals } from './global';

const ITEM_PER_ROW = 4;
const DIRECTIONS = {
	Up: 'up',
	Down: 'down',
	Left: 'left',
	Right: 'right',
	None: 'none',
};

export class UIPanelSystem extends System {
	init() {
		const { camera, renderer, scene } = globals;
		this._raycaster = new Raycaster();
		this._panelAnchor = new Group();
		this._root = new Root(camera, renderer, undefined, {
			flexDirection: 'column',
			justifyContent: 'space-evenly',
			alignItems: 'flex-start',
			backgroundColor: 'white',
			borderRadius: 1.5,
			backgroundOpacity: 0.7,
			padding: 0.6,
			gap: 0.5,
		});
		scene.add(this._panelAnchor);
		this._panelAnchor.add(this._root);

		this._selectionCoords = [0, 0];
		this._itemGrid = [];
		this._prevDirection = DIRECTIONS.None;

		let rowContainer = null;
		let gridRow = null;
		chairs.forEach((chair, i) => {
			if (i % ITEM_PER_ROW === 0) {
				rowContainer = new Container({
					flexDirection: 'row',
					justifyContent: 'space-evenly',
					alignItems: 'flex-start',
					gap: 0.5,
				});
				this._root.add(rowContainer);
				gridRow = [];
				this._itemGrid.push(gridRow);
			}

			const itemImage = new Image({
				src: 'assets/' + chair.image_path,
				width: 5,
				minWidth: 5,
				maxWidth: 5,
				minHeight: 5,
				height: 5,
				maxHeight: 5,
				objectFit: 'fill',
				borderRadius: 1,
				backgroundColor: 'white',
				borderWidth: 0.25,
				borderColor: 'white',
			});
			itemImage.userData.modelURL = chair['3dmodel_id'];
			gridRow.push(itemImage);

			const itemContainer = new Container({
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			})
				.add(itemImage)
				.add(
					new Text(chair.item_id, {
						fontSize: 0.7,
						fontWeight: 'extra-bold',
						color: 'black',
						textAlign: 'center',
					}),
				);

			rowContainer.add(itemContainer);
		});
		this._itemGrid[0][0].setStyle({
			borderColor: 'black',
		});
	}

	update(delta) {
		const controller = globals.controllers['left'];
		if (controller) {
			controller.targetRaySpace.getWorldPosition(this._panelAnchor.position);
			this._panelAnchor.position.y += 0.1;
			this._panelAnchor.lookAt(globals.playerHead.position);

			const gamepad = controller.gamepadWrapper;

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
				if (
					direction !== DIRECTIONS.None &&
					direction !== this._prevDirection
				) {
					const [currentRow, currentCol] = this._selectionCoords;
					let newCoords = [...this._selectionCoords];

					switch (direction) {
						case DIRECTIONS.Up:
							newCoords[0] = currentRow - 1;
							break;
						case DIRECTIONS.Down:
							newCoords[0] = currentRow + 1;
							break;
						case DIRECTIONS.Left:
							newCoords[1] = currentCol - 1;
							break;
						case DIRECTIONS.Right:
							newCoords[1] = currentCol + 1;
							break;
					}

					// Check if the new coordinates are within the bounds of the grid
					const [newRow, newCol] = newCoords;
					if (
						newRow >= 0 &&
						newRow < this._itemGrid.length &&
						newCol >= 0 &&
						newCol < this._itemGrid[newRow].length
					) {
						// Update the selection coordinates if the move is valid
						this._selectionCoords = newCoords;
						this._itemGrid[currentRow][currentCol].setStyle({
							borderColor: 'white',
						});
						this._itemGrid[newRow][newCol].setStyle({
							borderColor: 'black',
						});
					}
				}
				this._prevDirection = direction;
			} else {
				this._prevDirection = DIRECTIONS.None;
			}

			if (gamepad.getButtonDown(XR_BUTTONS.TRIGGER)) {
				const [currentRow, currentCol] = this._selectionCoords;
				globals.furnitureToSpawn =
					this._itemGrid[currentRow][currentCol].userData.modelURL;
			}
		}
		this._root.update(delta * 1000);
	}
}
