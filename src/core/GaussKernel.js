/**
 * Uses Pascal's Triangle to generate coefficients in the expansion of any binomial expression.
 *
 * For details see https://mathworld.wolfram.com/PascalsTriangle.html.
 *
 * @param {Number} n - The index of the coefficients row in Pascal's Triangle.
 * @return {Float64Array} The integer coefficients stored as doubles.
 * @ignore
 */

function getCoefficients(n) {

	let result;

	if(n === 0) {

		result = new Float64Array(0);

	} else if(n === 1) {

		result = new Float64Array([1]);

	} else if(n > 1) {

		// Incrementally build Pascal's Triangle to get the desired row.
		let row0 = new Float64Array(n);
		let row1 = new Float64Array(n);

		for(let y = 1; y <= n; ++y) {

			for(let x = 0; x < y; ++x) {

				row1[x] = (x === 0 || x === y - 1) ? 1 : row0[x - 1] + row0[x];

			}

			result = row1;
			row1 = row0;
			row0 = result;

		}

	}

	return result;

}

/**
 * A Gauss kernel.
 *
 * Based on https://github.com/Jam3/glsl-fast-gaussian-blur.
 */

export class GaussKernel {

	/**
	 * Constructs a new Gauss kernel.
	 *
	 * @param {Number} kernelSize - The kernel size. Should be an odd number in the range [3, 1020].
	 * @param {Number} [edgeBias=2] - Determines how many edge coefficients should be cut off for increased accuracy.
	 */

	constructor(kernelSize, edgeBias = 2) {

		/**
		 * The weights for discrete sampling.
		 *
		 * @type {Float64Array}
		 */

		this.weights = null;

		/**
		 * The offsets for discrete sampling.
		 *
		 * @type {Float64Array}
		 */

		this.offsets = null;

		/**
		 * The weights for linear sampling.
		 *
		 * @type {Float64Array}
		 */

		this.linearWeights = null;

		/**
		 * The offsets for linear sampling.
		 *
		 * @type {Float64Array}
		 */

		this.linearOffsets = null;

		this.generate(kernelSize, edgeBias);

	}

	/**
	 * The number of steps for discrete sampling.
	 *
	 * @type {Number}
	 */

	get steps() {

		return (this.offsets === null) ? 0 : this.offsets.length;

	}

	/**
	 * The number of steps for linear sampling.
	 *
	 * @type {Number}
	 */

	get linearSteps() {

		return (this.linearOffsets === null) ? 0 : this.linearOffsets.length;

	}

	/**
	 * Generates the kernel.
	 *
	 * @private
	 * @param {Number} kernelSize - The kernel size.
	 * @param {Number} edgeBias - The amount of edge coefficients to ignore.
	 */

	generate(kernelSize, edgeBias) {

		if(kernelSize < 3 || kernelSize > 1020) {

			throw new Error("The kernel size must be in the range [3, 1020]");

		}

		const n = kernelSize + edgeBias * 2;
		const coefficients = (edgeBias > 0) ?
			getCoefficients(n).slice(edgeBias, -edgeBias) :
			getCoefficients(n);

		const mid = Math.floor((coefficients.length - 1) / 2);
		const sum = coefficients.reduce((a, b) => a + b, 0);
		const weights = coefficients.slice(mid);
		const offsets = [...Array(mid + 1).keys()]; // [0..mid+1]

		const linearWeights = new Float64Array(Math.floor(offsets.length / 2));
		const linearOffsets = new Float64Array(linearWeights.length);
		linearWeights[0] = weights[0] / sum;

		for(let i = 1, j = 1, l = offsets.length - 1; i < l; i += 2, ++j) {

			const offset0 = offsets[i], offset1 = offsets[i + 1];
			const weight0 = weights[i], weight1 = weights[i + 1];

			const w = weight0 + weight1;
			const o = (offset0 * weight0 + offset1 * weight1) / w;

			linearWeights[j] = w / sum;
			linearOffsets[j] = o;

		}

		for(let i = 0, l = weights.length, s = 1.0 / sum; i < l; ++i) {

			weights[i] *= s;

		}

		// Ensure that the weights add up to 1.
		const linearWeightSum = (linearWeights.reduce((a, b) => a + b, 0) - linearWeights[0] * 0.5) * 2.0;

		if(linearWeightSum !== 0.0) {

			for(let i = 0, l = linearWeights.length, s = 1.0 / linearWeightSum; i < l; ++i) {

				linearWeights[i] *= s;

			}

		}

		this.offsets = offsets;
		this.weights = weights;
		this.linearOffsets = linearOffsets;
		this.linearWeights = linearWeights;

	}

}
