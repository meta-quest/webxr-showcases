/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MeshStandardMaterial } from 'three';

const kLeatherRoughness = 0.5;
const kLeatherMetalness = 0.0;
const kRubberRoughness = 0.7;
const kRubberMetalness = 0.7;

export const ShoeMaterials = {
	BlackLeather: new MeshStandardMaterial({
		color: 0x050505,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Black',
	}),
	WhiteLeather: new MeshStandardMaterial({
		color: 0xffffff,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'White',
	}),
	CobblestoneLeather: new MeshStandardMaterial({
		color: 0x979c99,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Cobblestone',
	}),
	SportRedLeather: new MeshStandardMaterial({
		color: 0xa0072c,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Sport Red',
	}),
	SailLeather: new MeshStandardMaterial({
		color: 0xd1c9bf,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Sail',
	}),
	OldRoyalLeather: new MeshStandardMaterial({
		color: 0x161369,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Old Royal',
	}),
	RoyalTintLeather: new MeshStandardMaterial({
		color: 0xa1bbe0,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Royal Tint',
	}),
	PinkFoamLeather: new MeshStandardMaterial({
		color: 0xe8ced3,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Pink Foam',
	}),
	KumquatLeather: new MeshStandardMaterial({
		color: 0xe48f3e,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Kumquat',
	}),
	TourYellowLeather: new MeshStandardMaterial({
		color: 0xffd73d,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Tour Yellow',
	}),
	LightBoneLeather: new MeshStandardMaterial({
		color: 0xedebde,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Light Bone',
	}),
	MalachiteLeather: new MeshStandardMaterial({
		color: 0x316e56,
		roughness: kLeatherRoughness,
		metalness: kLeatherMetalness,
		name: 'Malachite',
	}),
	WhiteRubber: new MeshStandardMaterial({
		color: 0xffffff,
		roughness: kRubberRoughness,
		metalness: kRubberMetalness,
		name: 'White',
	}),
	BlackRubber: new MeshStandardMaterial({
		color: 0x050505,
		roughness: kRubberRoughness,
		metalness: kRubberMetalness,
		name: 'Black',
	}),
	GumRubber: new MeshStandardMaterial({
		color: 0x935f38,
		roughness: kRubberRoughness,
		metalness: kRubberMetalness,
		name: 'Gum',
	}),
	SailRubber: new MeshStandardMaterial({
		color: 0xd1c9bf,
		roughness: kRubberRoughness,
		metalness: kRubberMetalness,
		name: 'Sail',
	}),
	SportRedRubber: new MeshStandardMaterial({
		color: 0xa0072c,
		roughness: kRubberRoughness,
		metalness: kRubberMetalness,
		name: 'Sport Red',
	}),
	OldRoyalRubber: new MeshStandardMaterial({
		color: 0x161369,
		roughness: kRubberRoughness,
		metalness: kRubberMetalness,
		name: 'Old Royal',
	}),
	CobblestoneRubber: new MeshStandardMaterial({
		color: 0x979c99,
		roughness: kRubberRoughness,
		metalness: kRubberMetalness,
		name: 'Cobblestone',
	}),
};

export const LeatherMaterials = [
	ShoeMaterials.BlackLeather,
	ShoeMaterials.WhiteLeather,
	ShoeMaterials.CobblestoneLeather,
	ShoeMaterials.SportRedLeather,
	ShoeMaterials.SailLeather,
	ShoeMaterials.OldRoyalLeather,
	ShoeMaterials.RoyalTintLeather,
	ShoeMaterials.PinkFoamLeather,
	ShoeMaterials.KumquatLeather,
	ShoeMaterials.TourYellowLeather,
	ShoeMaterials.LightBoneLeather,
	ShoeMaterials.MalachiteLeather,
];

export const RubberMaterials = [
	ShoeMaterials.GumRubber,
	ShoeMaterials.BlackRubber,
	ShoeMaterials.WhiteRubber,
	ShoeMaterials.SailRubber,
	ShoeMaterials.CobblestoneRubber,
	ShoeMaterials.SportRedRubber,
];

export const SHOE_PART_CONFIG_OPTIONS = {
	backtab: {
		displayName: 'Backtab',
		materials: LeatherMaterials,
		stichingMaterials: LeatherMaterials,
	},
	collar: {
		displayName: 'Collar / Lining',
		materials: LeatherMaterials,
	},
	eyestay: {
		displayName: 'Eyestay',
		materials: LeatherMaterials,
		secondaryMaterials: LeatherMaterials,
		stichingMaterials: LeatherMaterials,
	},
	heel_counter: {
		displayName: 'Heel Counter',
		materials: LeatherMaterials,
		stichingMaterials: LeatherMaterials,
	},
	lace: {
		displayName: 'Lace',
		materials: LeatherMaterials,
	},
	midsole: {
		displayName: 'Midsole',
		materials: RubberMaterials,
		stichingMaterials: LeatherMaterials,
	},
	outsole: {
		displayName: 'Outsole',
		materials: RubberMaterials,
	},
	quarter: {
		displayName: 'Quarter',
		materials: LeatherMaterials,
	},
	quarter_overlay: {
		displayName: 'Quarter Overlay',
		materials: LeatherMaterials,
		stichingMaterials: LeatherMaterials,
	},
	tip: {
		displayName: 'Tip',
		materials: LeatherMaterials,
		stichingMaterials: LeatherMaterials,
	},
	tongue: {
		displayName: 'Tongue',
		materials: LeatherMaterials,
		secondaryMaterials: LeatherMaterials,
		stichingMaterials: LeatherMaterials,
	},
	vamp: {
		displayName: 'Vamp',
		materials: LeatherMaterials,
	},
};

export const prefabs = {
	default: {
		backtab: { primary: 0, stiching: 4 },
		collar: { primary: 0 },
		eyestay: { primary: 0, secondary: 3, stiching: 4 },
		heel_counter: { primary: 0, stiching: 4 },
		lace: { primary: 0 },
		midsole: { primary: 3, stiching: 0 },
		outsole: { primary: 5 },
		quarter: { primary: 4 },
		quarter_overlay: { primary: 0, stiching: 4 },
		tip: { primary: 0, stiching: 4 },
		tongue: { primary: 4, secondary: 0, stiching: 4 },
		vamp: { primary: 4 },
	},
	mcdonalds: {
		backtab: { primary: 3, stiching: 8 },
		collar: { primary: 3 },
		eyestay: { primary: 3, secondary: 8, stiching: 8 },
		heel_counter: { primary: 3, stiching: 8 },
		lace: { primary: 3 },
		midsole: { primary: 3, stiching: 3 },
		outsole: { primary: 3 },
		quarter: { primary: 8 },
		quarter_overlay: { primary: 3, stiching: 8 },
		tip: { primary: 3, stiching: 8 },
		tongue: { primary: 8, secondary: 3, stiching: 8 },
		vamp: { primary: 8 },
	},
	panda: {
		backtab: { primary: 0, stiching: 0 },
		collar: { primary: 0 },
		eyestay: { primary: 1, secondary: 0, stiching: 0 },
		heel_counter: { primary: 0, stiching: 0 },
		lace: { primary: 0 },
		midsole: { primary: 2, stiching: 1 },
		outsole: { primary: 0 },
		quarter: { primary: 1 },
		quarter_overlay: { primary: 1, stiching: 0 },
		tip: { primary: 1, stiching: 0 },
		tongue: { primary: 1, secondary: 1, stiching: 0 },
		vamp: { primary: 1 },
	},
	stone: {
		backtab: { primary: 0, stiching: 0 },
		collar: { primary: 2 },
		eyestay: { primary: 2, secondary: 0, stiching: 2 },
		heel_counter: { primary: 2, stiching: 0 },
		lace: { primary: 0 },
		midsole: { primary: 0, stiching: 0 },
		outsole: { primary: 0 },
		quarter: { primary: 2 },
		quarter_overlay: { primary: 2, stiching: 0 },
		tip: { primary: 2, stiching: 0 },
		tongue: { primary: 0, secondary: 2, stiching: 0 },
		vamp: { primary: 2 },
	},
};
