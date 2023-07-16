import { RawImageData } from "../RawImageData.js";

/**
 * An 2D area, described by lower and upper bounds.
 *
 * @type {Float32Array[]}
 * @private
 */

const area = [
	new Float32Array(2),
	new Float32Array(2)
];

/**
 * The orthogonal texture size.
 *
 * @type {Number}
 * @private
 */

const ORTHOGONAL_SIZE = 16;

/**
 * The diagonal texture size.
 *
 * @type {Number}
 * @private
 */

const DIAGONAL_SIZE = 20;

/**
 * The number of samples for calculating areas in the diagonal textures.
 * Diagonal areas are calculated using brute force sampling.
 *
 * @type {Number}
 * @private
 */

const DIAGONAL_SAMPLES = 30;

/**
 * The maximum distance for smoothing U-shapes.
 *
 * @type {Number}
 * @private
 */

const SMOOTH_MAX_DISTANCE = 32;

/**
 * Subsampling offsets for orthogonal areas.
 *
 * @type {Float32Array}
 * @private
 */

const orthogonalSubsamplingOffsets = new Float32Array([
	0.0, -0.25, 0.25, -0.125, 0.125, -0.375, 0.375
]);

/**
 * Subsampling offset pairs for diagonal areas.
 *
 * @type {Float32Array[]}
 * @private
 */

const diagonalSubsamplingOffsets = [

	new Float32Array([0.0, 0.0]),
	new Float32Array([0.25, -0.25]),
	new Float32Array([-0.25, 0.25]),
	new Float32Array([0.125, -0.125]),
	new Float32Array([-0.125, 0.125])

];

/**
 * Orthogonal pattern positioning coordinates.
 *
 * Used for placing each pattern subtexture into a specific spot.
 *
 * @type {Uint8Array[]}
 * @private
 */

const orthogonalEdges = [

	new Uint8Array([0, 0]),
	new Uint8Array([3, 0]),
	new Uint8Array([0, 3]),
	new Uint8Array([3, 3]),

	new Uint8Array([1, 0]),
	new Uint8Array([4, 0]),
	new Uint8Array([1, 3]),
	new Uint8Array([4, 3]),

	new Uint8Array([0, 1]),
	new Uint8Array([3, 1]),
	new Uint8Array([0, 4]),
	new Uint8Array([3, 4]),

	new Uint8Array([1, 1]),
	new Uint8Array([4, 1]),
	new Uint8Array([1, 4]),
	new Uint8Array([4, 4])

];

/**
 * Diagonal pattern positioning coordinates.
 *
 * Used for placing each pattern subtexture into a specific spot.
 *
 * @type {Uint8Array[]}
 * @private
 */

const diagonalEdges = [

	new Uint8Array([0, 0]),
	new Uint8Array([1, 0]),
	new Uint8Array([0, 2]),
	new Uint8Array([1, 2]),

	new Uint8Array([2, 0]),
	new Uint8Array([3, 0]),
	new Uint8Array([2, 2]),
	new Uint8Array([3, 2]),

	new Uint8Array([0, 1]),
	new Uint8Array([1, 1]),
	new Uint8Array([0, 3]),
	new Uint8Array([1, 3]),

	new Uint8Array([2, 1]),
	new Uint8Array([3, 1]),
	new Uint8Array([2, 3]),
	new Uint8Array([3, 3])

];

/**
 * Linearly interpolates between two values.
 *
 * @private
 * @param {Number} a - The initial value.
 * @param {Number} b - The target value.
 * @param {Number} p - The interpolation value.
 * @return {Number} The interpolated value.
 */

function lerp(a, b, p) {

	return a + (b - a) * p;

}

/**
 * Clamps a value to the range [0, 1].
 *
 * @private
 * @param {Number} a - The value.
 * @return {Number} The saturated value.
 */

function saturate(a) {

	return Math.min(Math.max(a, 0.0), 1.0);

}

/**
 * A smoothing function for small U-patterns.
 *
 * @private
 * @param {Number} d - A smoothing factor.
 */

function smoothArea(d) {

	const a1 = area[0];
	const a2 = area[1];

	const b1X = Math.sqrt(a1[0] * 2.0) * 0.5;
	const b1Y = Math.sqrt(a1[1] * 2.0) * 0.5;
	const b2X = Math.sqrt(a2[0] * 2.0) * 0.5;
	const b2Y = Math.sqrt(a2[1] * 2.0) * 0.5;

	const p = saturate(d / SMOOTH_MAX_DISTANCE);

	a1[0] = lerp(b1X, a1[0], p);
	a1[1] = lerp(b1Y, a1[1], p);
	a2[0] = lerp(b2X, a2[0], p);
	a2[1] = lerp(b2Y, a2[1], p);

}

/**
 * Calculates the orthogonal area under the line p1 -> p2 for the pixels (x, x + 1).
 *
 * @private
 * @param {Number} p1X - The starting point of the line, X-component.
 * @param {Number} p1Y - The starting point of the line, Y-component.
 * @param {Number} p2X - The ending point of the line, X-component.
 * @param {Number} p2Y - The ending point of the line, Y-component.
 * @param {Number} x - The pixel index.
 * @param {Float32Array} result - A target tupel to store the area in.
 * @return {Float32Array} The area.
 */

function getOrthArea(p1X, p1Y, p2X, p2Y, x, result) {

	const dX = p2X - p1X;
	const dY = p2Y - p1Y;

	const x1 = x;
	const x2 = x + 1.0;

	const y1 = p1Y + dY * (x1 - p1X) / dX;
	const y2 = p1Y + dY * (x2 - p1X) / dX;

	// Check if x is inside the area.
	if((x1 >= p1X && x1 < p2X) || (x2 > p1X && x2 <= p2X)) {

		// Check if this is a trapezoid.
		if(Math.sign(y1) === Math.sign(y2) || Math.abs(y1) < 1e-4 || Math.abs(y2) < 1e-4) {

			const a = (y1 + y2) / 2.0;

			if(a < 0.0) {

				result[0] = Math.abs(a);
				result[1] = 0.0;

			} else {

				result[0] = 0.0;
				result[1] = Math.abs(a);

			}

		} else {

			// Two triangles.
			const t = -p1Y * dX / dY + p1X;
			const tInt = Math.trunc(t);

			const a1 = (t > p1X) ? y1 * (t - tInt) / 2.0 : 0.0;
			const a2 = (t < p2X) ? y2 * (1.0 - (t - tInt)) / 2.0 : 0.0;

			const a = (Math.abs(a1) > Math.abs(a2)) ? a1 : -a2;

			if(a < 0.0) {

				result[0] = Math.abs(a1);
				result[1] = Math.abs(a2);

			} else {

				result[0] = Math.abs(a2);
				result[1] = Math.abs(a1);

			}

		}

	} else {

		result[0] = 0.0;
		result[1] = 0.0;

	}

	return result;

}

/**
 * Calculates the area for a given pattern and distances to the left and to the
 * right, biased by an offset.
 *
 * @private
 * @param {Number} pattern - A pattern index.
 * @param {Number} left - The left distance.
 * @param {Number} right - The right distance.
 * @param {Number} offset - An offset.
 * @param {Float32Array} result - A target tupel to store the area in.
 * @return {Float32Array} The orthogonal area.
 */

function getOrthAreaForPattern(pattern, left, right, offset, result) {

	const a1 = area[0];
	const a2 = area[1];

	/* o1           |
	 *      .-------´
	 * o2   |
	 *
	 *      <---d--->
	 */

	const o1 = 0.5 + offset;
	const o2 = 0.5 + offset - 1.0;
	const d = left + right + 1;

	switch(pattern) {

		case 0: {

			//    ------

			result[0] = 0.0;
			result[1] = 0.0;

			break;

		}

		case 1: {

			/*   .------
			 *   |
			 *
			 * The offset is only applied to L patterns in the crossing edge side to make it converge with
			 * the unfiltered pattern 0. The pattern 0 must not be filtered to avoid artifacts.
			 */

			if(left <= right) {

				getOrthArea(0.0, o2, d / 2.0, 0.0, left, result);

			} else {

				result[0] = 0.0;
				result[1] = 0.0;

			}

			break;

		}

		case 2: {

			/*    ------.
			 *          |
			 */

			if(left >= right) {

				getOrthArea(d / 2.0, 0.0, d, o2, left, result);

			} else {

				result[0] = 0.0;
				result[1] = 0.0;

			}

			break;

		}

		case 3: {

			/*   .------.
			 *   |      |
			 */

			getOrthArea(0.0, o2, d / 2.0, 0.0, left, a1);
			getOrthArea(d / 2.0, 0.0, d, o2, left, a2);

			smoothArea(d, area);

			result[0] = a1[0] + a2[0];
			result[1] = a1[1] + a2[1];

			break;

		}

		case 4: {

			/*   |
			 *   `------
			 */

			if(left <= right) {

				getOrthArea(0.0, o1, d / 2.0, 0.0, left, result);

			} else {

				result[0] = 0.0;
				result[1] = 0.0;

			}

			break;

		}

		case 5: {

			/*   |
			 *   +------
			 *   |
			 */

			result[0] = 0.0;
			result[1] = 0.0;

			break;

		}

		case 6: {

			/*   |
			 *   `------.
			 *          |
			 *
			 * A problem of not offseting L patterns (see above) is that for certain max search distances,
			 * the pixels in the center of a Z pattern will detect the full Z pattern, while the pixels in
			 * the sides will detect an L pattern. To avoid discontinuities, the full offsetted Z
			 * revectorization is blended with partially offsetted L patterns.
			 */

			if(Math.abs(offset) > 0.0) {

				getOrthArea(0.0, o1, d, o2, left, a1);
				getOrthArea(0.0, o1, d / 2.0, 0.0, left, a2);
				getOrthArea(d / 2.0, 0.0, d, o2, left, result);

				a2[0] = a2[0] + result[0];
				a2[1] = a2[1] + result[1];

				result[0] = (a1[0] + a2[0]) / 2.0;
				result[1] = (a1[1] + a2[1]) / 2.0;

			} else {

				getOrthArea(0.0, o1, d, o2, left, result);

			}

			break;

		}

		case 7: {

			/*   |
			 *   +------.
			 *   |      |
			 */

			getOrthArea(0.0, o1, d, o2, left, result);

			break;

		}

		case 8: {

			/*          |
			 *    ------´
			 */

			if(left >= right) {

				getOrthArea(d / 2.0, 0.0, d, o1, left, result);

			} else {

				result[0] = 0.0;
				result[1] = 0.0;

			}

			break;

		}

		case 9: {

			/*          |
			 *   .------´
			 *   |
			 */

			if(Math.abs(offset) > 0.0) {

				getOrthArea(0.0, o2, d, o1, left, a1);
				getOrthArea(0.0, o2, d / 2.0, 0.0, left, a2);
				getOrthArea(d / 2.0, 0.0, d, o1, left, result);

				a2[0] = a2[0] + result[0];
				a2[1] = a2[1] + result[1];

				result[0] = (a1[0] + a2[0]) / 2.0;
				result[1] = (a1[1] + a2[1]) / 2.0;

			} else {

				getOrthArea(0.0, o2, d, o1, left, result);

			}

			break;

		}

		case 10: {

			/*          |
			 *    ------+
			 *          |
			 */

			result[0] = 0.0;
			result[1] = 0.0;

			break;

		}

		case 11: {

			/*          |
			 *   .------+
			 *   |      |
			 */

			getOrthArea(0.0, o2, d, o1, left, result);

			break;

		}

		case 12: {

			/*   |      |
			 *   `------´
			 */

			getOrthArea(0.0, o1, d / 2.0, 0.0, left, a1);
			getOrthArea(d / 2.0, 0.0, d, o1, left, a2);

			smoothArea(d, area);

			result[0] = a1[0] + a2[0];
			result[1] = a1[1] + a2[1];

			break;

		}

		case 13: {

			/*   |      |
			 *   +------´
			 *   |
			 */

			getOrthArea(0.0, o2, d, o1, left, result);

			break;

		}

		case 14: {

			/*   |      |
			 *   `------+
			 *          |
			 */

			getOrthArea(0.0, o1, d, o2, left, result);

			break;

		}

		case 15: {

			/*   |      |
			 *   +------+
			 *   |      |
			 */

			result[0] = 0.0;
			result[1] = 0.0;

			break;

		}

	}

	return result;

}

/**
 * Determines whether the given pixel is inside the specified area.
 *
 * @private
 * @param {Number} a1X - The lower bounds of the area, X-component.
 * @param {Number} a1Y - The lower bounds of the area, Y-component.
 * @param {Number} a2X - The upper bounds of the area, X-component.
 * @param {Number} a2Y - The upper bounds of the area, Y-component.
 * @param {Number} x - The X-coordinate.
 * @param {Number} y - The Y-coordinate.
 * @return {Boolean} Whether the pixel lies inside the area.
 */

function isInsideArea(a1X, a1Y, a2X, a2Y, x, y) {

	let result = (a1X === a2X && a1Y === a2Y);

	if(!result) {

		const xm = (a1X + a2X) / 2.0;
		const ym = (a1Y + a2Y) / 2.0;

		const a = a2Y - a1Y;
		const b = a1X - a2X;

		const c = a * (x - xm) + b * (y - ym);

		result = (c > 0.0);

	}

	return result;

}

/**
 * Calculates the diagonal area under the line p1 -> p2 for the pixel p using brute force sampling.
 *
 * @private
 * @param {Number} a1X - The lower bounds of the area, X-component.
 * @param {Number} a1Y - The lower bounds of the area, Y-component.
 * @param {Number} a2X - The upper bounds of the area, X-component.
 * @param {Number} a2Y - The upper bounds of the area, Y-component.
 * @param {Number} pX - The X-coordinate.
 * @param {Number} pY - The Y-coordinate.
 * @return {Number} The amount of pixels inside the area relative to the total amount of sampled pixels.
 */

function getDiagAreaForPixel(a1X, a1Y, a2X, a2Y, pX, pY) {

	let n = 0;

	for(let y = 0; y < DIAGONAL_SAMPLES; ++y) {

		for(let x = 0; x < DIAGONAL_SAMPLES; ++x) {

			const offsetX = x / (DIAGONAL_SAMPLES - 1.0);
			const offsetY = y / (DIAGONAL_SAMPLES - 1.0);

			if(isInsideArea(a1X, a1Y, a2X, a2Y, pX + offsetX, pY + offsetY)) {

				++n;

			}

		}

	}

	return n / (DIAGONAL_SAMPLES * DIAGONAL_SAMPLES);

}

/**
 * Calculates the area under the line p1 -> p2. This includes the pixel and its opposite.
 *
 * @private
 * @param {Number} pattern - A pattern index.
 * @param {Number} a1X - The lower bounds of the area, X-component.
 * @param {Number} a1Y - The lower bounds of the area, Y-component.
 * @param {Number} a2X - The upper bounds of the area, X-component.
 * @param {Number} a2Y - The upper bounds of the area, Y-component.
 * @param {Number} left - The left distance.
 * @param {Float32Array} offset - An offset.
 * @param {Float32Array} result - A target tupel to store the area in.
 * @return {Float32Array} The area.
 */

function getDiagArea(pattern, a1X, a1Y, a2X, a2Y, left, offset, result) {

	const e = diagonalEdges[pattern];
	const e1 = e[0];
	const e2 = e[1];

	if(e1 > 0) {

		a1X += offset[0];
		a1Y += offset[1];

	}

	if(e2 > 0) {

		a2X += offset[0];
		a2Y += offset[1];

	}

	result[0] = 1.0 - getDiagAreaForPixel(a1X, a1Y, a2X, a2Y, 1.0 + left, 0.0 + left);
	result[1] = getDiagAreaForPixel(a1X, a1Y, a2X, a2Y, 1.0 + left, 1.0 + left);

	return result;

}

/**
 * Calculates the area for a given pattern and distances to the left and right, biased by an offset.
 *
 * @private
 * @param {Number} pattern - A pattern index.
 * @param {Number} left - The left distance.
 * @param {Number} right - The right distance.
 * @param {Float32Array} offset - An offset.
 * @param {Float32Array} result - A target tupel to store the area in.
 * @return {Float32Array} The orthogonal area.
 */

function getDiagAreaForPattern(pattern, left, right, offset, result) {

	const a1 = area[0];
	const a2 = area[1];

	const d = left + right + 1;

	/* There is some Black Magic involved in the diagonal area calculations.
	 *
	 * Unlike orthogonal patterns, the "null" pattern (one without crossing edges) must be filtered, and the ends of both
	 * the "null" and L patterns are not known: L and U patterns have different endings, and the adjacent pattern is
	 * unknown. Therefore, a blend of both possibilities is computed.
	 */

	switch(pattern) {

		case 0: {

			/*         .-´
			 *       .-´
			 *     .-´
			 *   .-´
			 *   ´
			 */

			// First possibility.
			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 1.0 + d, left, offset, a1);

			// Second possibility.
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			// Blend both possibilities together.
			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 1: {

			/*         .-´
			 *       .-´
			 *     .-´
			 *   .-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 0.0, 0.0 + d, 0.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 2: {

			/*         .----
			 *       .-´
			 *     .-´
			 *   .-´
			 *   ´
			 */

			getDiagArea(pattern, 0.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 3: {

			/*
			 *         .----
			 *       .-´
			 *     .-´
			 *   .-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, result);

			break;

		}

		case 4: {

			/*         .-´
			 *       .-´
			 *     .-´
			 * ----´
			 */

			getDiagArea(pattern, 1.0, 1.0, 0.0 + d, 0.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 5: {

			/*         .-´
			 *       .-´
			 *     .-´
			 * --.-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 1.0, 0.0 + d, 0.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 6: {

			/*         .----
			 *       .-´
			 *     .-´
			 * ----´
			 */

			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 0.0 + d, left, offset, result);

			break;

		}

		case 7: {

			/*         .----
			 *       .-´
			 *     .-´
			 * --.-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 0.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 8: {

			/*         |
			 *         |
			 *       .-´
			 *     .-´
			 *   .-´
			 *   ´
			 */

			getDiagArea(pattern, 0.0, 0.0, 1.0 + d, 1.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 1.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 9: {

			/*         |
			 *         |
			 *       .-´
			 *     .-´
			 *   .-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 1.0 + d, left, offset, result);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 1.0 + d, left, offset, result);

			break;

		}

		case 10: {

			/*         |
			 *         .----
			 *       .-´
			 *     .-´
			 *   .-´
			 *   ´
			 */

			getDiagArea(pattern, 0.0, 0.0, 1.0 + d, 1.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 11: {

			/*         |
			 *         .----
			 *       .-´
			 *     .-´
			 *   .-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 1.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 12: {

			/*         |
			 *         |
			 *       .-´
			 *     .-´
			 * ----´
			 */

			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 1.0 + d, left, offset, result);

			break;

		}

		case 13: {

			/*         |
			 *         |
			 *       .-´
			 *     .-´
			 * --.-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 1.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 1.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 14: {

			/*         |
			 *         .----
			 *       .-´
			 *     .-´
			 * ----´
			 */

			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 1.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

		case 15: {

			/*         |
			 *         .----
			 *       .-´
			 *     .-´
			 * --.-´
			 *   |
			 *   |
			 */

			getDiagArea(pattern, 1.0, 1.0, 1.0 + d, 1.0 + d, left, offset, a1);
			getDiagArea(pattern, 1.0, 0.0, 1.0 + d, 0.0 + d, left, offset, a2);

			result[0] = (a1[0] + a2[0]) / 2.0;
			result[1] = (a1[1] + a2[1]) / 2.0;

			break;

		}

	}

	return result;

}

/**
 * Calculates orthogonal or diagonal patterns for a given offset.
 *
 * @private
 * @param {RawImageData[]} patterns - The patterns to assemble.
 * @param {Number|Float32Array} offset - A pattern offset. Diagonal offsets are pairs.
 * @param {Boolean} orthogonal - Whether the patterns are orthogonal or diagonal.
 */

function generatePatterns(patterns, offset, orthogonal) {

	const result = new Float32Array(2);

	for(let i = 0, l = patterns.length; i < l; ++i) {

		const pattern = patterns[i];
		const data = pattern.data;
		const size = pattern.width;

		for(let y = 0; y < size; ++y) {

			for(let x = 0; x < size; ++x) {

				if(orthogonal) {

					getOrthAreaForPattern(i, x, y, offset, result);

				} else {

					getDiagAreaForPattern(i, x, y, offset, result);

				}

				const c = (y * size + x) * 2;
				data[c] = result[0] * 255;
				data[c + 1] = result[1] * 255;

			}

		}

	}

}

/**
 * Assembles orthogonal or diagonal patterns into the final area image.
 *
 * @private
 * @param {Number} baseX - The base X-position.
 * @param {Number} baseY - The base Y-position.
 * @param {RawImageData[]} patterns - The patterns to assemble.
 * @param {Uint8Array[]} edges - Edge coordinate pairs, used for positioning.
 * @param {Number} size - The pattern size.
 * @param {Boolean} orthogonal - Whether the patterns are orthogonal or diagonal.
 * @param {RawImageData} target - The target image data.
 */

function assemble(baseX, baseY, patterns, edges, size, orthogonal, target) {

	const dstData = target.data;
	const dstWidth = target.width;

	for(let i = 0, l = patterns.length; i < l; ++i) {

		const edge = edges[i];
		const pattern = patterns[i];

		const srcData = pattern.data;
		const srcWidth = pattern.width;

		for(let y = 0; y < size; ++y) {

			for(let x = 0; x < size; ++x) {

				const pX = edge[0] * size + baseX + x;
				const pY = edge[1] * size + baseY + y;

				const c = (pY * dstWidth + pX) * 4;

				// The texture coords of orthogonal patterns are compressed quadratically to reach longer distances.
				const d = orthogonal ? ((y * y * srcWidth + x * x) * 2) : ((y * srcWidth + x) * 2);

				dstData[c] = srcData[d];
				dstData[c + 1] = srcData[d + 1];
				dstData[c + 2] = 0;
				dstData[c + 3] = 255;

			}

		}

	}

}

/**
 * SMAA area image data.
 *
 * This texture allows to obtain the area for a certain pattern and distances to the left and right of identified lines.
 *
 * Based on the official python scripts:
 *  https://github.com/iryoku/smaa/tree/master/Scripts
 */

export class SMAAAreaImageData {

	/**
	 * Creates a new area image.
	 *
	 * @return {RawImageData} The generated image data.
	 */

	static generate() {

		const width = 2 * 5 * ORTHOGONAL_SIZE;
		const height = orthogonalSubsamplingOffsets.length * 5 * ORTHOGONAL_SIZE;

		const data = new Uint8ClampedArray(width * height * 4);
		const result = new RawImageData(width, height, data);

		const orthPatternSize = Math.pow(ORTHOGONAL_SIZE - 1, 2) + 1;
		const diagPatternSize = DIAGONAL_SIZE;

		const orthogonalPatterns = [];
		const diagonalPatterns = [];

		for(let i = 3, l = data.length; i < l; i += 4) {

			data[i] = 255;

		}

		// Prepare 16 image data sets for the orthogonal and diagonal subtextures.
		for(let i = 0; i < 16; ++i) {

			orthogonalPatterns.push(new RawImageData(
				orthPatternSize, orthPatternSize,
				new Uint8ClampedArray(orthPatternSize * orthPatternSize * 2),
				2
			));

			diagonalPatterns.push(new RawImageData(
				diagPatternSize, diagPatternSize,
				new Uint8ClampedArray(diagPatternSize * diagPatternSize * 2),
				2
			));

		}

		for(let i = 0, l = orthogonalSubsamplingOffsets.length; i < l; ++i) {

			// Generate 16 orthogonal patterns for each offset.
			generatePatterns(orthogonalPatterns, orthogonalSubsamplingOffsets[i], true);

			// Assemble the orthogonal patterns and place them on the left side.
			assemble(
				0,
				5 * ORTHOGONAL_SIZE * i,
				orthogonalPatterns,
				orthogonalEdges,
				ORTHOGONAL_SIZE,
				true,
				result
			);

		}

		for(let i = 0, l = diagonalSubsamplingOffsets.length; i < l; ++i) {

			// Generate 16 diagonal patterns for each offset.
			generatePatterns(diagonalPatterns, diagonalSubsamplingOffsets[i], false);

			// Assemble the diagonal patterns and place them on the right side.
			assemble(
				5 * ORTHOGONAL_SIZE,
				4 * DIAGONAL_SIZE * i,
				diagonalPatterns,
				diagonalEdges,
				DIAGONAL_SIZE,
				false,
				result
			);

		}

		return result;

	}

}
