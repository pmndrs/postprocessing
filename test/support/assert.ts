import assert from "node:assert/strict";

const EPSILON = 1e-12;

export function assertClose(actual: number, expected: number, message?: string): void {

	assert.ok(
		Number.isFinite(actual) && Math.abs(actual - expected) <= EPSILON,
		message ?? `Expected ${actual} to be close to ${expected}`
	);

}

export function assertCloseSequence(actual: ArrayLike<number>, expected: ArrayLike<number>, message?: string): void {

	assert.equal(actual.length, expected.length, message ?? "Expected sequences to have the same length");

	for(let i = 0; i < expected.length; ++i) {

		assertClose(actual[i], expected[i]);

	}

}
