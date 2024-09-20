/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LoadingManager, TextureLoader } from 'three';

import { Component } from 'elics';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

export class GlobalComponent extends Component {}

const LOADING_MANAGER = new LoadingManager();
const DRACO_LOADER = new DRACOLoader(LOADING_MANAGER).setDecoderPath(
	`vendor/draco/gltf/`,
);
export const KTX2_LOADER = new KTX2Loader(LOADING_MANAGER).setTranscoderPath(
	`vendor/basis/`,
);

const gltfLoader = new GLTFLoader(LOADING_MANAGER)
	.setCrossOrigin('anonymous')
	.setDRACOLoader(DRACO_LOADER);

const textureLoader = new TextureLoader(LOADING_MANAGER);

const exrLoader = new EXRLoader(LOADING_MANAGER);

export { gltfLoader, textureLoader, exrLoader };
