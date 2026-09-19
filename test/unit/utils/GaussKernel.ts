import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GaussKernel } from "postprocessing";
import { assertClose, assertCloseSequence } from "../../support/assert.ts";

describe("GaussKernel", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => GaussKernel.create(9, 3));

	});

	it("produces the expected discrete offsets and weights", () => {

		const kernel = GaussKernel.create(9, 1);

		assert.equal(kernel.steps, 5);

		// Offsets run from the center (index 0) outwards by one sample each step.
		assertCloseSequence(kernel.offsets, [0, 1, 2, 3, 4]);

		// Center-aligned discrete Gaussian for sigma = 1, normalized so the symmetric kernel sums to 1.
		// The center weight is exp(0) / sum = 1 / 2.5066...
		assertCloseSequence(kernel.weights, [
			0.39894346935609781,
			0.24197144565660075,
			0.053991127420704416,
			0.0044318616200312664,
			0.00013383062461474178
		]);

	});

	it("produces the expected linear offsets and weights", () => {

		const kernel = GaussKernel.create(9, 1);

		assert.equal(kernel.linearSteps, 3);

		// linearWeights combine the adjacent discrete samples for bilinear filtering,
		// and linearOffsets are their weighted centroids.
		assertCloseSequence(kernel.linearWeights, [
			0.39894346935609781,
			0.29596257307730517,
			0.0045656922446460080
		]);

		assertCloseSequence(kernel.linearOffsets, [
			0,
			1.1824255238063563,
			3.0293122307513562
		]);

	});

	it("normalizes the symmetric kernel to sum to one", () => {

		for(const [kernelSize, sigma] of [[3, 0.7], [5, 1.5], [9, 1], [15, 2], [9, 3]] as const) {

			const kernel = GaussKernel.create(kernelSize, sigma);

			// The stored weights cover only the center and one side;
			// the full symmetric kernel therefore sums as weights[0] + 2 * (sum of the remaining weights).
			const sum = Array.from(kernel.weights).reduce(
				(total, weight, index) => total + weight * (index === 0 ? 1 : 2),
				0.0
			);

			assertClose(sum, 1.0);

		}

	});

	it("keeps the weights centered, positive, and monotonically decreasing", () => {

		const kernel = GaussKernel.create(15, 1.5);

		assert.equal(kernel.offsets[0], 0);

		for(let i = 0; i < kernel.steps; ++i) {

			const weight = kernel.weights[i];

			assert.ok(weight > 0.0, `weight[${i}] should be positive`);

			if(i > 0) {

				const previous = kernel.weights[i - 1];
				assert.ok(weight < previous, `weight[${i}] should decrease from weight[${i - 1}]`);

			}

		}

	});

	it("partitions the half-kernel energy across the linear weights", () => {

		for(const [kernelSize, sigma] of [[5, 2], [7, 0.5], [9, 1], [11, 1], [9, 3]] as const) {

			const kernel = GaussKernel.create(kernelSize, sigma);

			const linearSum = Array.from(kernel.linearWeights).reduce(
				(total, weight) => total + weight,
				0.0
			);

			// The linear weights must account for exactly the discrete half-kernel
			// (center plus one side), which is (1 + centerWeight) / 2.
			assertClose(linearSum, (1.0 + kernel.weights[0]) / 2.0);

		}

	});

	it("rejects invalid kernel sizes and sigma", () => {

		for(const kernelSize of [0, 2, 4, -1, 9.5, 1021, Number.NaN, Number.POSITIVE_INFINITY]) {

			assert.throws(
				() => GaussKernel.create(kernelSize, 1.0),
				{ name: "Error", message: /kernel size/i }
			);

		}

		for(const sigma of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {

			assert.throws(
				() => GaussKernel.create(9, sigma),
				{ name: "Error", message: /sigma/i }
			);

		}

	});

});
