import {
	AdditiveBlending,
	BufferGeometry,
	DoubleSide,
	Float32BufferAttribute,
	Mesh,
	MeshBasicMaterial,
} from 'three';

export function createFurnitureMarker() {
	const geometry = new BufferGeometry();

	// Vertices positions for the 4 vertical walls of the cube (4 faces)
	const vertices = [
		// Front face
		-0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0.2, 0.5, 0.5, 0.2, 0.5,

		// Right face
		0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0.2, 0.5, 0.5, 0.2, -0.5,

		// Back face
		0.5, 0, -0.5, -0.5, 0, -0.5, 0.5, 0.2, -0.5, -0.5, 0.2, -0.5,

		// Left face
		-0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0.2, -0.5, -0.5, 0.2, 0.5,
	];

	// Index array for the 4 faces (each face consists of 2 triangles)
	const indices = [
		0,
		1,
		2,
		1,
		3,
		2, // Front face
		4,
		5,
		6,
		5,
		7,
		6, // Right face
		8,
		9,
		10,
		9,
		11,
		10, // Back face
		12,
		13,
		14,
		13,
		15,
		14, // Left face
	];

	// Colors array with a gradient effect (white at bottom, transparent at top)
	const colors = [
		// Front face
		1,
		1,
		1,
		1, // Bottom left - opaque white
		1,
		1,
		1,
		1, // Bottom right - opaque white
		1,
		1,
		1,
		0, // Top left - transparent
		1,
		1,
		1,
		0, // Top right - transparent

		// Right face
		1,
		1,
		1,
		1, // Bottom left - opaque white
		1,
		1,
		1,
		1, // Bottom right - opaque white
		1,
		1,
		1,
		0, // Top left - transparent
		1,
		1,
		1,
		0, // Top right - transparent

		// Back face
		1,
		1,
		1,
		1, // Bottom left - opaque white
		1,
		1,
		1,
		1, // Bottom right - opaque white
		1,
		1,
		1,
		0, // Top left - transparent
		1,
		1,
		1,
		0, // Top right - transparent

		// Left face
		1,
		1,
		1,
		1, // Bottom left - opaque white
		1,
		1,
		1,
		1, // Bottom right - opaque white
		1,
		1,
		1,
		0, // Top left - transparent
		1,
		1,
		1,
		0, // Top right - transparent
	];

	geometry.setIndex(indices);
	geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
	geometry.setAttribute('color', new Float32BufferAttribute(colors, 4)); // 4 components for RGBA

	const material = new MeshBasicMaterial({
		vertexColors: true,
		transparent: true,
		opacity: 0.6,
		blending: AdditiveBlending,
		side: DoubleSide,
	});

	return new Mesh(geometry, material);
}
