/**
 * A Gauss kernel.
 *
 * @category Utils
 */

export class GaussKernel {

	/**
	 * The weights for discrete sampling.
	 */

	readonly weights: Readonly<Float64Array>;

	/**
	 * The offsets for discrete sampling.
	 */

	readonly offsets: Readonly<Float64Array>;

	/**
	 * The weights for linear sampling.
	 */

	readonly linearWeights: Readonly<Float64Array>;

	/**
	 * The offsets for linear sampling.
	 */

	readonly linearOffsets: Readonly<Float64Array>;

	/**
	 * Constructs a new Gauss kernel.
	 *
	 * @param weights - The weights.
	 * @param offsets - The offsets.
	 * @param linearWeights - The weights for linear sampling.
	 * @param linearOffsets - The offsets for linear sampling.
	 */

	private constructor(
		weights: Float64Array,
		offsets: Float64Array,
		linearWeights: Float64Array,
		linearOffsets: Float64Array
	) {

		this.weights = weights;
		this.offsets = offsets;
		this.linearWeights = linearWeights;
		this.linearOffsets = linearOffsets;

	}

	/**
	 * The number of steps for discrete sampling.
	 */

	get steps(): number {

		return this.offsets.length;

	}

	/**
	 * The number of steps for linear sampling.
	 */

	get linearSteps(): number {

		return this.linearOffsets.length;

	}

	/**
	 * Creates a new kernel.
	 *
	 * @throws If the kernel could not be created due to invalid input.
	 * @param kernelSize - The kernel size. Must be an odd integer in the range [3, 1020].
	 * @param sigma - The standard deviation of the Gaussian distribution.
	 * @return The kernel.
	 */

	static create(kernelSize: number, sigma: number): GaussKernel {

		if(
			kernelSize < 3 ||
			kernelSize > 1020 ||
			!Number.isInteger(kernelSize) ||
			!Number.isFinite(kernelSize) ||
			kernelSize % 2 === 0
		) {

			throw new Error("The kernel size must be an odd integer in the range [3, 1020]");

		}

		if(sigma <= 0 || !Number.isFinite(sigma)) {

			throw new Error("sigma must be a finite number greater than 0");

		}

		const mid = Math.floor((kernelSize - 1) / 2);
		const offsets = new Float64Array(mid + 1);
		const weights = new Float64Array(mid + 1);

		const scale = -1.0 / (2.0 * sigma * sigma);

		let sum = 0.0;

		for(let i = 0; i <= mid; ++i) {

			const weight = Math.exp(i * i * scale);

			offsets[i] = i;
			weights[i] = weight;

			sum += (i === 0) ? weight : weight * 2.0;

		}

		// Normalize the discrete weights.
		const inverseSum = 1.0 / sum;

		for(let i = 0; i <= mid; ++i) {

			weights[i] *= inverseSum;

		}

		// Combine adjacent samples for bilinear filtering.
		// The shader evaluates `(c0 + c1) * linearWeights[i]` at linearOffsets[i],
		// so the combined weight is the sum of the two discrete weights and the offset is their weighted centroid.
		const linearSteps = Math.ceil(mid / 2) + 1;
		const linearWeights = new Float64Array(linearSteps);
		const linearOffsets = new Float64Array(linearSteps);

		linearWeights[0] = weights[0];
		linearOffsets[0] = 0.0;

		for(let i = 1, j = 1; i <= mid; i += 2, ++j) {

			const weight0 = weights[i];
			const weight1 = (i + 1 <= mid) ? weights[i + 1] : 0.0;
			const weight = weight0 + weight1;

			linearWeights[j] = weight;
			linearOffsets[j] = weight1 > 0.0 ? (i * weight0 + (i + 1) * weight1) / weight : i;

		}

		return new GaussKernel(
			weights,
			offsets,
			linearWeights,
			linearOffsets
		);

	}

}
