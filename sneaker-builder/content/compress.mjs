import { Logger, NodeIO } from '@gltf-transform/core';
import { Mode, toktx } from '@gltf-transform/cli';
import { dedup, draco, textureCompress } from '@gltf-transform/functions';

import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const compress = async (path, outputPath) => {
	// Configure I/O.
	const io = new NodeIO()
		.registerExtensions(ALL_EXTENSIONS)
		.registerDependencies({
			'draco3d.decoder': await draco3d.createDecoderModule(), // Optional.
			'draco3d.encoder': await draco3d.createEncoderModule(), // Optional.
		});

	// Read from URL.
	const document = await io.read(path);
	const debugLogger = new Logger(Logger.Verbosity.DEBUG);
	document.setLogger(debugLogger);

	console.log(document.getRoot().listMaterials());

	console.log('compressing draco');

	await document.transform(
		// Remove duplicate vertex or texture data, if any.
		dedup(),
		// Compress mesh geometry with Draco.
		draco(),
	);

	console.log('compressing textures');

	await document.transform(
		textureCompress({
			encoder: sharp,
			targetFormat: 'png',
		}),
	);

	console.log('compressing ktx');

	await document.transform(
		toktx({
			pattern: '^((?!leather_bump).)*$',
			mode: Mode.ETC1S,
			quality: 255,
		}),
	);

	await document.transform(
		toktx({
			pattern: '(leather_bump).*$',
			mode: Mode.UASTC,
			level: 4,
			rdo: 4,
			zstd: 18,
		}),
	);

	await io.write(outputPath, document);
};

compress('content/gltf/sneaker.gltf', 'src/assets/gltf/sneaker.gltf').then(
	() => {
		console.log('done');
	},
);

compress('content/gltf/shadow.gltf', 'src/assets/gltf/shadow.gltf').then(() => {
	console.log('done');
});
