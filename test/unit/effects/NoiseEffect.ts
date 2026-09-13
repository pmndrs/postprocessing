import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NoiseEffect } from "postprocessing";

describe("NoiseEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new NoiseEffect());

	});

	it("can be disposed", () => {

		const object = new NoiseEffect();
		assert.doesNotThrow(() => object.dispose());

	});

	it("is deterministic for a given seed", () => {

		const a = new NoiseEffect({ seed: 1 });
		const b = new NoiseEffect({ seed: 1 });
		assert.strictEqual(a.in.defines.get("SEED"), b.in.defines.get("SEED"));

		const c = new NoiseEffect({ seed: 2 });
		assert.notStrictEqual(a.in.defines.get("SEED"), c.in.defines.get("SEED"));

	});

});
