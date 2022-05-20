/**
 * Uses Pascal's Triangle to generate coefficients in the expansion of any binomial expression.
 *
 * For details see https://mathworld.wolfram.com/PascalsTriangle.html
 *
 * @param {Number} n - The index of the coefficients row in Pascal's Triangle.
 * @return {Float64Array} The coefficients.
 * @ignore
 */

function getCoefficients(n) {

	let result;

	if(n === 1) {

		result = new Float64Array([1]);

	} else if(n > 1) {

		// Incrementally build Pascal's Triangle to get the desired row.
		let row0 = new Float64Array(n);
		let row1 = new Float64Array(n - 1);
		result = row0;

		for(let y = 1; y <= n; ++y) {

			for(let x = 0; x < y; ++x) {

				row1[x] = (x === 0 || x === y - 1) ? 1 : row0[x - 1] + row0[x];

			}

			const row = row0;
			row0 = row1;
			row1 = row;

		}

	}

	return result;

}

/**
 * Generates a Gauss kernel.
 *
 * Based on https://github.com/Jam3/glsl-fast-gaussian-blur
 *
 * @param {Number} kernelSize - The kernel size. Must be an odd number.
 * @param {Number} [edgeBias=2] - Determines how many edge coefficients should be cut off for increased accuracy.
 * @return {Object} The weights, offsets, linear weights and linear offsets.
 */

export function generateGaussKernel(kernelSize, edgeBias = 2) {

	if(kernelSize % 2 === 0) {

		throw new Error("The kernel size must be an odd number");

	}

	const n = kernelSize + edgeBias * 2;
	const coefficients = getCoefficients(n).slice(edgeBias, -edgeBias);
	const mid = Math.floor((coefficients.length - 1) / 2);
	const sum = coefficients.reduce((a, b) => a + b);
	const weights = coefficients.slice(mid);
	const offsets = [...Array(mid + 1).keys()]; // [0..mid+1]

	const linearWeights = new Float32Array(Math.floor(offsets.length / 2));
	const linearOffsets = new Float32Array(linearWeights.length);
	linearWeights[0] = weights[0] / sum;

	for(let i = 1, j = 1, l = offsets.length - 1; i < l; i += 2, ++j) {

		const offset0 = offsets[i], offset1 = offsets[i + 1];
		const weight0 = weights[i], weight1 = weights[i + 1];

		const s = weight0 + weight1;
		const t = (offset0 * weight0 + offset1 * weight1) / s;

		linearOffsets[j] = t;
		linearWeights[j] = s / sum;

	}

	// Ensure that the weights add up to 1.
	const weightSum = (linearWeights.reduce((a, b) => a + b) - linearWeights[0] * 0.5) * 2.0;
	const correction = 1.0 / weightSum;

	for(let i = 0, l = linearWeights.length; i < l; ++i) {

		linearWeights[i] *= correction;

	}

	return {
		offsets,
		weights,
		linearOffsets,
		linearWeights,
		steps: offsets.length,
		linearSteps: linearOffsets.length
	};

}
