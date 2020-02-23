import { RawImageData } from "../../RawImageData.js";

/**
 * A 2D vector.
 *
 * @private
 */

class Vector2 {

	/**
	 * Constructs a new vector.
	 *
	 * @param {Number} [x=0] - The initial x value.
	 * @param {Number} [y=0] - The initial y value.
	 */

	constructor(x = 0, y = 0) {

		/**
		 * The X component.
		 *
		 * @type {Number}
		 */

		this.x = x;

		/**
		 * The Y component.
		 *
		 * @type {Number}
		 */

		this.y = y;

	}

	/**
	 * Sets the components of this vector.
	 *
	 * @param {Number} x - The new x value.
	 * @param {Number} y - The new y value.
	 * @return {Vector2} This vector.
	 */

	set(x, y) {

		this.x = x;
		this.y = y;

		return this;

	}

	/**
	 * Checks if the given vector equals this vector.
	 *
	 * @param {Vector2} v - A vector.
	 * @return {Boolean} Whether this vector equals the given one.
	 */

	equals(v) {

		return (this === v || (this.x === v.x && this.y === v.y));

	}

}

/**
 * A 2D box.
 *
 * @private
 */

class Box2 {

	/**
	 * Constructs a new box.
	 */

	constructor() {

		this.min = new Vector2();
		this.max = new Vector2();

	}

}

/**
 * A box.
 *
 * @type {Box2}
 * @private
 */

const b0 = new Box2();

/**
 * A box.
 *
 * @type {Box2}
 * @private
 */

const b1 = new Box2();

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
 * @param {Box2} b - The area that should be smoothed.
 * @return {Box2} The smoothed area.
 */

function smoothArea(d, b) {

	const a1 = b.min;
	const a2 = b.max;

	const b1X = Math.sqrt(a1.x * 2.0) * 0.5;
	const b1Y = Math.sqrt(a1.y * 2.0) * 0.5;
	const b2X = Math.sqrt(a2.x * 2.0) * 0.5;
	const b2Y = Math.sqrt(a2.y * 2.0) * 0.5;

	const p = saturate(d / SMOOTH_MAX_DISTANCE);

	a1.set(lerp(b1X, a1.x, p), lerp(b1Y, a1.y, p));
	a2.set(lerp(b2X, a2.x, p), lerp(b2Y, a2.y, p));

	return b;

}

/**
 * Calculates the area under the line p1 -> p2, for the pixels (x, x + 1).
 *
 * @private
 * @param {Vector2} p1 - The starting point of the line.
 * @param {Vector2} p2 - The ending point of the line.
 * @param {Number} x - The pixel index.
 * @param {Vector2} result - A target vector to store the area in.
 * @return {Vector2} The area.
 */

function calculateOrthogonalArea(p1, p2, x, result) {

	const dX = p2.x - p1.x;
	const dY = p2.y - p1.y;

	const x1 = x;
	const x2 = x + 1.0;

	const y1 = p1.y + dY * (x1 - p1.x) / dX;
	const y2 = p1.y + dY * (x2 - p1.x) / dX;

	let a, a1, a2, t;

	// Check if x is inside the area.
	if((x1 >= p1.x && x1 < p2.x) || (x2 > p1.x && x2 <= p2.x)) {

		// Check if this is a trapezoid.
		if(Math.sign(y1) === Math.sign(y2) || Math.abs(y1) < 1e-4 || Math.abs(y2) < 1e-4) {

			a = (y1 + y2) / 2.0;

			if(a < 0.0) {

				result.set(Math.abs(a), 0.0);

			} else {

				result.set(0.0, Math.abs(a));

			}

		} else {

			// Two triangles.
			t = -p1.y * dX / dY + p1.x;

			a1 = (t > p1.x) ? y1 * (t - Math.trunc(t)) / 2.0 : 0.0;
			a2 = (t < p2.x) ? y2 * (1.0 - (t - Math.trunc(t))) / 2.0 : 0.0;

			a = (Math.abs(a1) > Math.abs(a2)) ? a1 : -a2;

			if(a < 0.0) {

				result.set(Math.abs(a1), Math.abs(a2));

			} else {

				result.set(Math.abs(a2), Math.abs(a1));

			}

		}

	} else {

		result.set(0, 0);

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
 * @param {Vector2} result - A target vector to store the area in.
 * @return {Vector2} The orthogonal area.
 */

function calculateOrthogonalAreaForPattern(pattern, left, right, offset, result) {

	const p1 = b0.min;
	const p2 = b0.max;
	const a1 = b1.min;
	const a2 = b1.max;
	const a = b1;

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

			result.set(0, 0);

			break;

		}

		case 1: {

			/*   .------
			 *   |
			 *
			 * The offset is only applied to L patterns in the crossing edge side to
			 * make it converge with the unfiltered pattern 0.
			 * The pattern 0 must not be filtered to avoid artifacts.
			 */

			if(left <= right) {

				calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, result);

			} else {

				result.set(0, 0);

			}

			break;

		}

		case 2: {

			/*    ------.
			 *          |
			 */

			if(left >= right) {

				calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, result);

			} else {

				result.set(0, 0);

			}

			break;

		}

		case 3: {

			/*   .------.
			 *   |      |
			 */

			calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, a1);
			calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, a2);

			smoothArea(d, a);

			result.set(a1.x + a2.x, a1.y + a2.y);

			break;

		}

		case 4: {

			/*   |
			 *   `------
			 */

			if(left <= right) {

				calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, result);

			} else {

				result.set(0, 0);

			}

			break;

		}

		case 5: {

			/*   |
			 *   +------
			 *   |
			 */

			result.set(0, 0);

			break;

		}

		case 6: {

			/*   |
			 *   `------.
			 *          |
			 *
			 * A problem of not offseting L patterns (see above) is that for certain
			 * max search distances, the pixels in the center of a Z pattern will
			 * detect the full Z pattern, while the pixels in the sides will detect an
			 * L pattern. To avoid discontinuities, the full offsetted Z
			 * revectorization is blended with partially offsetted L patterns.
			 */

			if(Math.abs(offset) > 0.0) {

				calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, a1);
				calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, a2);
				calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, result);
				a2.set(a2.x + result.x, a2.y + result.y);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

			} else {

				calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);

			}

			break;

		}

		case 7: {

			/*   |
			 *   +------.
			 *   |      |
			 */

			calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);

			break;

		}

		case 8: {

			/*          |
			 *    ------´
			 */

			if(left >= right) {

				calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, result);

			} else {

				result.set(0, 0);

			}

			break;

		}

		case 9: {

			/*          |
			 *   .------´
			 *   |
			 */

			if(Math.abs(offset) > 0.0) {

				calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, a1);
				calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, a2);
				calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, result);
				a2.set(a2.x + result.x, a2.y + result.y);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

			} else {

				calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);

			}

			break;

		}

		case 10: {

			/*          |
			 *    ------+
			 *          |
			 */

			result.set(0, 0);

			break;

		}

		case 11: {

			/*          |
			 *   .------+
			 *   |      |
			 */

			calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);

			break;

		}

		case 12: {

			/*   |      |
			 *   `------´
			 */

			calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, a1);
			calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, a2);

			smoothArea(d, a);

			result.set(a1.x + a2.x, a1.y + a2.y);

			break;

		}

		case 13: {

			/*   |      |
			 *   +------´
			 *   |
			 */

			calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);

			break;

		}

		case 14: {

			/*   |      |
			 *   `------+
			 *          |
			 */

			calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);

			break;

		}

		case 15: {

			/*   |      |
			 *   +------+
			 *   |      |
			 */

			result.set(0, 0);

			break;

		}

	}

	return result;

}

/**
 * Determines whether the given pixel is inside the specified area.
 *
 * @private
 * @param {Vector2} p1 - The lower bounds of the area.
 * @param {Vector2} p2 - The upper bounds of the area.
 * @param {Vector2} x - The X-coordinates.
 * @param {Vector2} y - The Y-coordinates.
 * @return {Vector2} Whether the pixel lies inside the area.
 */

function isInsideArea(p1, p2, x, y) {

	let result = p1.equals(p2);

	if(!result) {

		let xm = (p1.x + p2.x) / 2.0;
		let ym = (p1.y + p2.y) / 2.0;

		let a = p2.y - p1.y;
		let b = p1.x - p2.x;

		let c = a * (x - xm) + b * (y - ym);

		result = (c > 0.0);

	}

	return result;

}

/**
 * Calculates the area under the line p1 -> p2 for the pixel p using brute force
 * sampling.
 *
 * @private
 * @param {Vector2} p1 - The lower bounds of the area.
 * @param {Vector2} p2 - The upper bounds of the area.
 * @param {Number} pX - The X-coordinates.
 * @param {Number} pY - The Y-coordinates.
 * @return {Number} The amount of pixels inside the area relative to the total amount of sampled pixels.
 */

function calculateDiagonalAreaForPixel(p1, p2, pX, pY) {

	let a;
	let x, y;
	let offsetX, offsetY;

	for(a = 0, y = 0; y < DIAGONAL_SAMPLES; ++y) {

		for(x = 0; x < DIAGONAL_SAMPLES; ++x) {

			offsetX = x / (DIAGONAL_SAMPLES - 1.0);
			offsetY = y / (DIAGONAL_SAMPLES - 1.0);

			if(isInsideArea(p1, p2, pX + offsetX, pY + offsetY)) {

				++a;

			}

		}

	}

	return a / (DIAGONAL_SAMPLES * DIAGONAL_SAMPLES);

}

/**
 * Calculates the area under the line p1 -> p2. This includes the pixel and its
 * opposite.
 *
 * @private
 * @param {Number} pattern - A pattern index.
 * @param {Vector2} p1 - The lower bounds of the area.
 * @param {Vector2} p2 - The upper bounds of the area.
 * @param {Number} left - The left distance.
 * @param {Float32Array} offset - An offset.
 * @param {Vector2} result - A target vector to store the area in.
 * @return {Vector2} The area.
 */

function calculateDiagonalArea(pattern, p1, p2, left, offset, result) {

	const e = diagonalEdges[pattern];
	const e1 = e[0];
	const e2 = e[1];

	if(e1 > 0) {

		p1.x += offset[0];
		p1.y += offset[1];

	}

	if(e2 > 0) {

		p2.x += offset[0];
		p2.y += offset[1];

	}

	return result.set(
		1.0 - calculateDiagonalAreaForPixel(p1, p2, 1.0 + left, 0.0 + left),
		calculateDiagonalAreaForPixel(p1, p2, 1.0 + left, 1.0 + left)
	);

}

/**
 * Calculates the area for a given pattern and distances to the left and to the
 * right, biased by an offset.
 *
 * @private
 * @param {Number} pattern - A pattern index.
 * @param {Number} left - The left distance.
 * @param {Number} right - The right distance.
 * @param {Float32Array} offset - An offset.
 * @param {Vector2} result - A target vector to store the area in.
 * @return {Vector2} The orthogonal area.
 */

function calculateDiagonalAreaForPattern(pattern, left, right, offset, result) {

	const p1 = b0.min;
	const p2 = b0.max;
	const a1 = b1.min;
	const a2 = b1.max;

	const d = left + right + 1;

	/* There is some Black Magic involved in the diagonal area calculations.
	 *
	 * Unlike orthogonal patterns, the "null" pattern (one without crossing edges)
	 * must be filtered, and the ends of both the "null" and L patterns are not
	 * known: L and U patterns have different endings, and the adjacent pattern is
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
			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);

			// Second possibility.
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			// Blend both possibilities together.
			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

			break;

		}

		case 2: {

			/*         .----
			 *       .-´
			 *     .-´
			 *   .-´
			 *   ´
			 */

			calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, result);

			break;

		}

		case 4: {

			/*         .-´
			 *       .-´
			 *     .-´
			 * ----´
			 */

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

			break;

		}

		case 6: {

			/*         .----
			 *       .-´
			 *     .-´
			 * ----´
			 */

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, result);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

			calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, result);

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

			calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

			break;

		}

		case 12: {

			/*         |
			 *         |
			 *       .-´
			 *     .-´
			 * ----´
			 */

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, result);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

			break;

		}

		case 14: {

			/*         |
			 *         .----
			 *       .-´
			 *     .-´
			 * ----´
			 */

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

			calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
			calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

			result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

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

	const result = new Vector2();

	let i, l;
	let x, y;
	let c;

	let pattern;
	let data, size;

	for(i = 0, l = patterns.length; i < l; ++i) {

		pattern = patterns[i];

		data = pattern.data;
		size = pattern.width;

		for(y = 0; y < size; ++y) {

			for(x = 0; x < size; ++x) {

				if(orthogonal) {

					calculateOrthogonalAreaForPattern(i, x, y, offset, result);

				} else {

					calculateDiagonalAreaForPattern(i, x, y, offset, result);

				}

				c = (y * size + x) * 2;

				data[c] = result.x * 255;
				data[c + 1] = result.y * 255;

			}

		}

	}

}

/**
 * Assembles orthogonal or diagonal patterns into the final area image.
 *
 * @private
 * @param {Vector2} base - A base position.
 * @param {RawImageData[]} patterns - The patterns to assemble.
 * @param {Uint8Array[]} edges - Edge coordinate pairs, used for positioning.
 * @param {Number} size - The pattern size.
 * @param {Boolean} orthogonal - Whether the patterns are orthogonal or diagonal.
 * @param {RawImageData} target - The target image data.
 */

function assemble(base, patterns, edges, size, orthogonal, target) {

	const p = new Vector2();

	const dstData = target.data;
	const dstWidth = target.width;

	let i, l;
	let x, y;
	let c, d;

	let edge;
	let pattern;
	let srcData, srcWidth;

	for(i = 0, l = patterns.length; i < l; ++i) {

		edge = edges[i];
		pattern = patterns[i];

		srcData = pattern.data;
		srcWidth = pattern.width;

		for(y = 0; y < size; ++y) {

			for(x = 0; x < size; ++x) {

				p.set(
					edge[0] * size + base.x + x,
					edge[1] * size + base.y + y
				);

				c = (p.y * dstWidth + p.x) * 4;

				/* The texture coordinates of orthogonal patterns are compressed
				quadratically to reach longer distances for a given texture size. */
				d = orthogonal ? ((y * y * srcWidth + x * x) * 2) :
					((y * srcWidth + x) * 2);

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
 * This texture allows to obtain the area for a certain pattern and distances
 * to the left and to the right of the identified line.
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

		const orthogonalPatternSize = Math.pow(ORTHOGONAL_SIZE - 1, 2) + 1;
		const diagonalPatternSize = DIAGONAL_SIZE;

		const orthogonalPatterns = [];
		const diagonalPatterns = [];

		const base = new Vector2();

		let i, l;

		// Prepare 16 image data sets for the orthogonal and diagonal subtextures.
		for(i = 0; i < 16; ++i) {

			orthogonalPatterns.push(new RawImageData(orthogonalPatternSize, orthogonalPatternSize,
				new Uint8ClampedArray(orthogonalPatternSize * orthogonalPatternSize * 2), 2));

			diagonalPatterns.push(new RawImageData(diagonalPatternSize, diagonalPatternSize,
				new Uint8ClampedArray(diagonalPatternSize * diagonalPatternSize * 2), 2));

		}

		for(i = 0, l = orthogonalSubsamplingOffsets.length; i < l; ++i) {

			// Generate 16 orthogonal patterns for each offset.
			generatePatterns(orthogonalPatterns, orthogonalSubsamplingOffsets[i], true);

			// Assemble the orthogonal patterns and place them on the left side.
			base.set(0, 5 * ORTHOGONAL_SIZE * i);
			assemble(base, orthogonalPatterns, orthogonalEdges, ORTHOGONAL_SIZE, true, result);

		}

		for(i = 0, l = diagonalSubsamplingOffsets.length; i < l; ++i) {

			// Generate 16 diagonal patterns for each offset.
			generatePatterns(diagonalPatterns, diagonalSubsamplingOffsets[i], false);

			// Assemble the diagonal patterns and place them on the right side.
			base.set(5 * ORTHOGONAL_SIZE, 4 * DIAGONAL_SIZE * i);
			assemble(base, diagonalPatterns, diagonalEdges, DIAGONAL_SIZE, false, result);

		}

		return result;

	}

}
