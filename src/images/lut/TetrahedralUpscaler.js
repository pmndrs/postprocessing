/**
 * Two temporary vectors.
 *
 * @type {Float32Array[]}
 * @private
 */

const P = [
	new Float32Array(3),
	new Float32Array(3)
];

/**
 * Four temporary RGB color containers.
 *
 * @type {Float32Array[]}
 * @private
 */

const C = [
	new Float32Array(3),
	new Float32Array(3),
	new Float32Array(3),
	new Float32Array(3)
];

/**
 * Six congruent and equal sized tetrahedra, each defined by four vertices.
 *
 * @type {Float32Array[][]}
 * @private
 */

const T = [
	[
		new Float32Array([0, 0, 0]),
		new Float32Array([1, 0, 0]),
		new Float32Array([1, 1, 0]),
		new Float32Array([1, 1, 1])
	], [
		new Float32Array([0, 0, 0]),
		new Float32Array([1, 0, 0]),
		new Float32Array([1, 0, 1]),
		new Float32Array([1, 1, 1])
	], [
		new Float32Array([0, 0, 0]),
		new Float32Array([0, 0, 1]),
		new Float32Array([1, 0, 1]),
		new Float32Array([1, 1, 1])
	], [
		new Float32Array([0, 0, 0]),
		new Float32Array([0, 1, 0]),
		new Float32Array([1, 1, 0]),
		new Float32Array([1, 1, 1])
	], [
		new Float32Array([0, 0, 0]),
		new Float32Array([0, 1, 0]),
		new Float32Array([0, 1, 1]),
		new Float32Array([1, 1, 1])
	], [
		new Float32Array([0, 0, 0]),
		new Float32Array([0, 0, 1]),
		new Float32Array([0, 1, 1]),
		new Float32Array([1, 1, 1])
	]
];

/**
 * Calculates the volume of a given tetrahedron.
 *
 * @private
 * @param {Float32Array} a - A tetrahedron vertex.
 * @param {Float32Array} b - A tetrahedron vertex.
 * @param {Float32Array} c - A tetrahedron vertex.
 * @param {Float32Array} d - A tetrahedron vertex.
 * @return {Number} The volume.
 */

function calculateTetrahedronVolume(a, b, c, d) {

	// Calculate the area of the base triangle.
	const bcX = c[0] - b[0];
	const bcY = c[1] - b[1];
	const bcZ = c[2] - b[2];

	const baX = a[0] - b[0];
	const baY = a[1] - b[1];
	const baZ = a[2] - b[2];

	const crossX = bcY * baZ - bcZ * baY;
	const crossY = bcZ * baX - bcX * baZ;
	const crossZ = bcX * baY - bcY * baX;

	const length = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
	const triangleArea = length * 0.5;

	// Construct the base plane.
	const normalX = crossX / length;
	const normalY = crossY / length;
	const normalZ = crossZ / length;
	const constant = -(a[0] * normalX + a[1] * normalY + a[2] * normalZ);

	// Calculate the height of the tetrahedron.
	const dot = d[0] * normalX + d[1] * normalY + d[2] * normalZ;
	const height = Math.abs(dot + constant);

	return height * triangleArea / 3.0;

}

/**
 * Samples the given data.
 *
 * @private
 * @param {TypedArray} data - The source data (RGBA).
 * @param {Number} size - The size of the source texture.
 * @param {Number} x - The X coordinate.
 * @param {Number} y - The Y coordinate.
 * @param {Number} z - The Z coordinate.
 * @param {Float32Array} color - A container for the sampled color.
 */

function sample(data, size, x, y, z, color) {

	const i4 = (x + y * size + z * size * size) * 4;
	color[0] = data[i4 + 0];
	color[1] = data[i4 + 1];
	color[2] = data[i4 + 2];

}

/**
 * Samples the given data using tetrahedral interpolation.
 *
 * @private
 * @param {TypedArray} data - The source data.
 * @param {Number} size - The size of the source texture.
 * @param {Number} u - The U coordinate.
 * @param {Number} v - The V coordinate.
 * @param {Number} w - The W coordinate.
 * @param {Float32Array} color - A container for the sampled color.
 */

function tetrahedralSample(data, size, u, v, w, color) {

	const px = u * (size - 1.0);
	const py = v * (size - 1.0);
	const pz = w * (size - 1.0);

	const minX = Math.floor(px);
	const minY = Math.floor(py);
	const minZ = Math.floor(pz);

	const maxX = Math.ceil(px);
	const maxY = Math.ceil(py);
	const maxZ = Math.ceil(pz);

	// Get the UVW coordinates relative to the min and max pixels.
	const su = px - minX;
	const sv = py - minY;
	const sw = pz - minZ;

	if(minX === px && minY === py && minZ === pz) {

		sample(data, size, px, py, pz, color);

	} else {

		let vertices;

		if(su >= sv && sv >= sw) {

			vertices = T[0];

		} else if(su >= sw && sw >= sv) {

			vertices = T[1];

		} else if(sw >= su && su >= sv) {

			vertices = T[2];

		} else if(sv >= su && su >= sw) {

			vertices = T[3];

		} else if(sv >= sw && sw >= su) {

			vertices = T[4];

		} else if(sw >= sv && sv >= su) {

			vertices = T[5];

		}

		const [P0, P1, P2, P3] = vertices;

		const coords = P[0];
		coords[0] = su; coords[1] = sv; coords[2] = sw;

		const tmp = P[1];
		const diffX = maxX - minX;
		const diffY = maxY - minY;
		const diffZ = maxZ - minZ;

		tmp[0] = diffX * P0[0] + minX;
		tmp[1] = diffY * P0[1] + minY;
		tmp[2] = diffZ * P0[2] + minZ;
		sample(data, size, tmp[0], tmp[1], tmp[2], C[0]);

		tmp[0] = diffX * P1[0] + minX;
		tmp[1] = diffY * P1[1] + minY;
		tmp[2] = diffZ * P1[2] + minZ;
		sample(data, size, tmp[0], tmp[1], tmp[2], C[1]);

		tmp[0] = diffX * P2[0] + minX;
		tmp[1] = diffY * P2[1] + minY;
		tmp[2] = diffZ * P2[2] + minZ;
		sample(data, size, tmp[0], tmp[1], tmp[2], C[2]);

		tmp[0] = diffX * P3[0] + minX;
		tmp[1] = diffY * P3[1] + minY;
		tmp[2] = diffZ * P3[2] + minZ;
		sample(data, size, tmp[0], tmp[1], tmp[2], C[3]);

		const V0 = calculateTetrahedronVolume(P1, P2, P3, coords) * 6.0;
		const V1 = calculateTetrahedronVolume(P0, P2, P3, coords) * 6.0;
		const V2 = calculateTetrahedronVolume(P0, P1, P3, coords) * 6.0;
		const V3 = calculateTetrahedronVolume(P0, P1, P2, coords) * 6.0;

		C[0][0] *= V0; C[0][1] *= V0; C[0][2] *= V0;
		C[1][0] *= V1; C[1][1] *= V1; C[1][2] *= V1;
		C[2][0] *= V2; C[2][1] *= V2; C[2][2] *= V2;
		C[3][0] *= V3; C[3][1] *= V3; C[3][2] *= V3;

		color[0] = C[0][0] + C[1][0] + C[2][0] + C[3][0];
		color[1] = C[0][1] + C[1][1] + C[2][1] + C[3][1];
		color[2] = C[0][2] + C[1][2] + C[2][2] + C[3][2];

	}

}

/**
 * A tetrahedral upscaler that can be used to augment 3D LUTs.
 *
 * Based on an implementation by Garrett Johnson:
 * https://github.com/gkjohnson/threejs-sandbox/blob/master/3d-lut/src/TetrahedralUpscaler.js
 */

export class TetrahedralUpscaler {

	/**
	 * Expands the given data to the target size.
	 *
	 * @param {TypedArray} data - The input RGBA data. Assumed to be cubic.
	 * @param {Number} size - The target size.
	 * @return {TypedArray} The new data.
	 */

	static expand(data, size) {

		const originalSize = Math.cbrt(data.length / 4);

		const rgb = new Float32Array(3);
		const array = new data.constructor(size ** 3 * 4);
		const maxValue = (data instanceof Uint8Array) ? 255 : 1.0;
		const sizeSq = size ** 2;
		const s = 1.0 / (size - 1.0);

		for(let z = 0; z < size; ++z) {

			for(let y = 0; y < size; ++y) {

				for(let x = 0; x < size; ++x) {

					const u = x * s;
					const v = y * s;
					const w = z * s;
					const i4 = Math.round(x + y * size + z * sizeSq) * 4;

					tetrahedralSample(data, originalSize, u, v, w, rgb);

					array[i4 + 0] = rgb[0];
					array[i4 + 1] = rgb[1];
					array[i4 + 2] = rgb[2];
					array[i4 + 3] = maxValue;

				}

			}

		}

		return array;

	}

}
