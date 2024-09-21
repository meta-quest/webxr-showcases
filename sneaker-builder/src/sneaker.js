/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PlaneGeometry,
	SRGBColorSpace,
} from 'three';
import {
	LeatherMaterials,
	SHOE_PART_CONFIG_OPTIONS,
	prefabs,
} from './constants';
import { gltfLoader, textureLoader } from './global';

import { GrabComponent } from './grab';
import { Text } from 'troika-three-text';

const CONFIG_PANEL_TEXTURE = textureLoader.load('assets/color_picker_ui.png');
CONFIG_PANEL_TEXTURE.colorSpace = SRGBColorSpace;

const VAMP_HOLE_MATERIAL = new MeshBasicMaterial({
	color: 0x000000,
});

export const loadSneakers = (world, global) => {
	gltfLoader.load('assets/gltf/sneaker.gltf', (gltf) => {
		const model = gltf.scene;
		model.traverse((node) => {
			if (node.material) {
				const reconstructedMaterial = new MeshStandardMaterial({
					color: 0x000000,
					map: node.material.map,
					normalMap: node.material.normalMap,
					roughness: 0.7,
				});

				node.material = reconstructedMaterial;

				if (node.name == 'vholes') {
					node.material = VAMP_HOLE_MATERIAL;
					node.visible = true;
				}
			}
			if (node.geometry) {
				node.geometry.computeBoundsTree();
			}
		});
		const sneakerMeshRight = new Group().add(model.clone());
		sneakerMeshRight.scale.set(1, 1, -1);
		sneakerMeshRight.userData.shoeId = 'right';
		global.sneakerRight = new Sneaker(sneakerMeshRight);
		global.sneakerRight.grabComponent = world
			.createEntity()
			.addComponent(GrabComponent, { object3D: sneakerMeshRight });

		const sneakerMeshLeft = new Group().add(model);
		sneakerMeshLeft.userData.shoeId = 'left';
		global.sneakerLeft = new Sneaker(sneakerMeshLeft);
		global.sneakerLeft.grabComponent = world
			.createEntity()
			.addComponent(GrabComponent, { object3D: sneakerMeshLeft });
	});
};

export class Sneaker {
	constructor(sneakerMesh) {
		this._uiElements = { partName: null };

		this._sneakerObject = sneakerMesh;
		this._tongueMesh = null;
		this._backtabMesh = null;
		this._tongueLabels = [];
		this._backtabLabels = [];
		this._tongueLabelBackings = [];

		const uiRoot = new Group();

		const configPanel = new Mesh(
			new PlaneGeometry(0.3, 0.2025),
			new MeshBasicMaterial({
				color: 0xffffff,
				map: CONFIG_PANEL_TEXTURE,
				transparent: true,
			}),
		);
		uiRoot.add(configPanel);

		this._uiElements.partName = new Text();
		this._uiElements.partName.text = 'PartName';
		this._uiElements.partName.fontSize = 0.026;
		this._uiElements.partName.color = 0xffffff;
		this._uiElements.partName.anchorX = 'center';
		this._uiElements.partName.anchorY = 'middle';
		this._uiElements.partName.position.z = 0.001;
		this._uiElements.partName.position.y = 0.056;
		this._uiElements.partName.sync();
		configPanel.add(this._uiElements.partName);

		this._uiElements.colorName = new Text();
		this._uiElements.colorName.text = 'Color';
		this._uiElements.colorName.fontSize = 0.016;
		this._uiElements.colorName.color = 0xffffff;
		this._uiElements.colorName.anchorX = 'center';
		this._uiElements.colorName.anchorY = 'middle';
		this._uiElements.colorName.position.z = 0.001;
		this._uiElements.colorName.position.y = 0.0025;
		this._uiElements.colorName.sync();
		configPanel.add(this._uiElements.colorName);
		configPanel.position.set(0, 0.25, -0.2);

		const vamp = sneakerMesh.getObjectByName('vamp');

		this._uiElements.colorSwatches = [];
		gltfLoader.load('assets/swatch.glb', (gltf) => {
			const swatchTile = gltf.scene.getObjectByName('swatch_tile');
			this._selectionRing = gltf.scene.getObjectByName('swatch_ring');
			configPanel.add(this._selectionRing);
			this._selectionRing.visible = false;
			for (let j = 0; j < 2; ++j) {
				for (let i = 0; i < 6; ++i) {
					const swatch = new Mesh(
						swatchTile.geometry,
						new MeshStandardMaterial({
							color: 0xffffff,
							normalMap: vamp.material.normalMap,
						}),
					);
					swatch.position.x = -0.11 + 0.044 * i;

					const index = j * 6 + i;
					this.updateMaterial(swatch.material, LeatherMaterials[index]);
					swatch.material.roughness = 0.0;
					swatch.material.metalness = 0.1;
					swatch.name = 'color-swatch';
					swatch.userData.material_index = index;
					swatch.visible = false;

					this._uiElements.colorSwatches.push(swatch);
					configPanel.add(swatch);
				}
			}
		});

		this._shoeParts = {};
		this._intersectParts = [];

		Object.entries(SHOE_PART_CONFIG_OPTIONS).forEach(
			([partName, configOptions]) => {
				this._shoeParts[partName] = {
					primary: sneakerMesh.getObjectByName(partName),
				};
				this._intersectParts.push(this._shoeParts[partName].primary);
				if (configOptions.secondaryMaterials) {
					this._shoeParts[partName].secondary = sneakerMesh.getObjectByName(
						partName + '_secondary',
					);
					this._intersectParts.push(this._shoeParts[partName].secondary);
				}
				if (configOptions.stichingMaterials) {
					this._shoeParts[partName].stiching = sneakerMesh.getObjectByName(
						partName + '_stiching',
					);
				}
				Object.values(this._shoeParts[partName]).forEach((node) => {
					node.userData.colorIndex = 0;
					node.userData.key = partName;
					node.material.emissive.setHex(0xffffff);
					node.material.emissiveIntensity = 0;
				});
			},
		);

		sneakerMesh.traverse((child) => {
			if (child.isMesh) {
				child.userData.colorIndex = 0;
			}
		});

		this.setPrefab(prefabs.default);

		this._shoepartSelected = null;
		this._plane = uiRoot;
	}

	getShoeIntersect(raycaster) {
		this._intersectParts.forEach((part) => {
			part.material.emissiveIntensity = 0;
		});
		const intersect = raycaster.intersectObjects(this._intersectParts)[0];
		if (intersect) {
			intersect.object.material.emissiveIntensity = 0.1;
			return {
				partName: intersect.object.userData.key,
				distance: intersect.distance,
			};
		}
	}

	setPrefab(prefab) {
		Object.entries(prefab).forEach(([partName, materialConfig]) => {
			Object.entries(materialConfig).forEach(([materialKey, colorIndex]) => {
				this.updateShoePartMaterial(partName, materialKey, colorIndex);
			});
		});
	}

	updateShoePartMaterial(partName, materialKey, colorIndex) {
		const material = SHOE_PART_CONFIG_OPTIONS[partName].materials[colorIndex];
		const shoePart = this._shoeParts[partName][materialKey];
		shoePart.material.color = material.color;
		shoePart.material.roughness = material.roughness;
		shoePart.material.metalness = material.metalness;
		shoePart.material.name = material.name;
		shoePart.userData.colorIndex = colorIndex;
	}

	updateMaterial(dest, src) {
		dest.color = src.color;
		dest.roughness = src.roughness;
		dest.metalness = src.metalness;
		dest.name = src.name;
	}

	get uiPlane() {
		return this._plane;
	}

	get mesh() {
		return this._sneakerObject;
	}

	createCopy() {
		return this._sneakerObject.clone();
	}

	setShoePart(partName) {
		this._shoepartSelected = this._sneakerObject.getObjectByName(partName);
		this._uiElements.partName.text =
			SHOE_PART_CONFIG_OPTIONS[partName].displayName;
		this._uiElements.partName.sync();

		this._updateColorNameUI();
		this._updateColorSwatchesUI();
	}

	_updateColorNameUI() {
		let mesh;
		if (this._shoepartSelected.isMesh) {
			mesh = this._shoepartSelected;
		} else {
			this._shoepartSelected.traverse((child) => {
				if (child.isMesh) {
					mesh = child;
				}
			});
		}

		if (mesh !== undefined) {
			this._uiElements.colorName.text = mesh.material.name;
		} else {
			this._uiElements.colorName.text = 'Unknown';
		}
		this._uiElements.colorName.sync();
	}

	_updateColorSwatchesUI() {
		// Get a mesh so we can get the materials
		let mesh;
		if (this._shoepartSelected.isMesh) {
			mesh = this._shoepartSelected;
		} else {
			this._shoepartSelected.traverse((child) => {
				if (child.isMesh) {
					mesh = child;
				}
			});
		}

		this._selectionRing.visible = false;

		const configOptions = SHOE_PART_CONFIG_OPTIONS[mesh.userData.key];

		const bSingleRow = configOptions.materials.length == 6;
		for (let i = 0; i < this._uiElements.colorSwatches.length; ++i) {
			const swatch = this._uiElements.colorSwatches[i];
			if (i < configOptions.materials.length) {
				swatch.visible = true;
				swatch.position.z = 0;
				this.updateMaterial(swatch.material, configOptions.materials[i]);
				if (bSingleRow) {
					swatch.position.y = -0.052;
				} else {
					swatch.position.y = i > 5 ? -0.074 : -0.03;
				}
				if (i == mesh.userData.colorIndex) {
					this._selectionRing.position.copy(swatch.position);
					this._selectionRing.visible = true;
				}
			} else {
				swatch.position.z = -0.5;
				swatch.visible = false;
			}
		}
	}

	update(colorIndex, justClicked) {
		if (justClicked && this._shoepartSelected) {
			this._shoepartSelected.traverse((child) => {
				if (child.isMesh) {
					child.userData.colorIndex = colorIndex;
					const srcMat =
						SHOE_PART_CONFIG_OPTIONS[this._shoepartSelected.name].materials[
							colorIndex
						];
					if (srcMat) {
						this.updateMaterial(child.material, srcMat);
					}
				}
			});

			this._updateColorNameUI();
			this._updateColorSwatchesUI();
		}
	}
}
