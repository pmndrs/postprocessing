import { RawImageData } from "../RawImageData.js";

/**
 * This dictionary returns which edges are active for a certain bilinear fetch: it's the reverse lookup of the bilinear
 * function.
 *
 * @type {Map<Number, Float32Array>}
 * @private
 */

const edges = new Map([

	[bilinear(0, 0, 0, 0), new Float32Array([0, 0, 0, 0])],
	[bilinear(0, 0, 0, 1), new Float32Array([0, 0, 0, 1])],
	[bilinear(0, 0, 1, 0), new Float32Array([0, 0, 1, 0])],
	[bilinear(0, 0, 1, 1), new Float32Array([0, 0, 1, 1])],

	[bilinear(0, 1, 0, 0), new Float32Array([0, 1, 0, 0])],
	[bilinear(0, 1, 0, 1), new Float32Array([0, 1, 0, 1])],
	[bilinear(0, 1, 1, 0), new Float32Array([0, 1, 1, 0])],
	[bilinear(0, 1, 1, 1), new Float32Array([0, 1, 1, 1])],

	[bilinear(1, 0, 0, 0), new Float32Array([1, 0, 0, 0])],
	[bilinear(1, 0, 0, 1), new Float32Array([1, 0, 0, 1])],
	[bilinear(1, 0, 1, 0), new Float32Array([1, 0, 1, 0])],
	[bilinear(1, 0, 1, 1), new Float32Array([1, 0, 1, 1])],

	[bilinear(1, 1, 0, 0), new Float32Array([1, 1, 0, 0])],
	[bilinear(1, 1, 0, 1), new Float32Array([1, 1, 0, 1])],
	[bilinear(1, 1, 1, 0), new Float32Array([1, 1, 1, 0])],
	[bilinear(1, 1, 1, 1), new Float32Array([1, 1, 1, 1])]

]);

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
 * Calculates the bilinear fetch for a certain edge combination.
 *
 *     e[0]       e[1]
 *
 *              x <-------- Sample Position: (-0.25, -0.125)
 *     e[2]       e[3] <--- Current Pixel [3]: (0.0, 0.0)
 *
 * @private
 * @param {Number} e0 - The edge combination.
 * @param {Number} e1 - The edge combination.
 * @param {Number} e2 - The edge combination.
 * @param {Number} e3 - The edge combination.
 * @return {Number} The interpolated value.
 */

function bilinear(e0, e1, e2, e3) {

	const a = lerp(e0, e1, 1.0 - 0.25);
	const b = lerp(e2, e3, 1.0 - 0.25);

	return lerp(a, b, 1.0 - 0.125);

}

/**
 * Computes the delta distance to add in the last step of searches to the left.
 *
 * @private
 * @param {Float32Array} left - The left edge combination.
 * @param {Float32Array} top - The top edge combination.
 * @return {Number} The left delta distance.
 */

function deltaLeft(left, top) {

	let d = 0;

	// If there is an edge, continue.
	if(top[3] === 1) {

		d += 1;

	}

	// If an edge was previously found, there's another edge and no crossing edges, continue.
	if(d === 1 && top[2] === 1 && left[1] !== 1 && left[3] !== 1) {

		d += 1;

	}

	return d;

}

/**
 * Computes the delta distance to add in the last step of searches to the right.
 *
 * @private
 * @param {Float32Array} left - The left edge combination.
 * @param {Float32Array} top - The top edge combination.
 * @return {Number} The right delta distance.
 */

function deltaRight(left, top) {

	let d = 0;

	// If there is an edge, and no crossing edges, continue.
	if(top[3] === 1 && left[1] !== 1 && left[3] !== 1) {

		d += 1;

	}

	// If an edge was previously found, there's another edge and there are no crossing edges.
	if(d === 1 && top[2] === 1 && left[0] !== 1 && left[2] !== 1) {

		d += 1;

	}

	return d;

}

/**
 * SMAA search image data.
 *
 * This image stores information about how many pixels the line search algorithm must advance in the last step.
 *
 * Based on the official python scripts:
 *  https://github.com/iryoku/smaa/tree/master/Scripts
 */

export class SMAASearchImageData {

	/**
	 * Creates a new search image.
	 *
	 * @return {RawImageData} The generated image data.
	 */

	static generate() {

		const width = 66;
		const height = 33;
		const halfWidth = width / 2;

		const croppedWidth = 64;
		const croppedHeight = 16;

		const data = new Uint8ClampedArray(width * height);
		const croppedData = new Uint8ClampedArray(croppedWidth * croppedHeight * 4);

		// Calculate delta distances.
		for(let y = 0; y < height; ++y) {

			for(let x = 0; x < width; ++x) {

				const s = 0.03125 * x;
				const t = 0.03125 * y;

				if(edges.has(s) && edges.has(t)) {

					const e1 = edges.get(s);
					const e2 = edges.get(t);

					const i = y * width + x;

					// Maximize the dynamic range to help the compression.
					data[i] = (127 * deltaLeft(e1, e2));
					data[i + halfWidth] = (127 * deltaRight(e1, e2));

				}

			}

		}

		// Crop the result to powers-of-two to make it BC4-friendly.
		for(let i = 0, y = height - croppedHeight; y < height; ++y) {

			for(let x = 0; x < croppedWidth; ++x, i += 4) {

				croppedData[i] = data[y * width + x];
				croppedData[i + 3] = 255;

			}

		}

		return new RawImageData(croppedWidth, croppedHeight, croppedData);

	}

}
