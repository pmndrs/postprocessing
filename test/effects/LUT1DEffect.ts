import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LUT1DEffect } from "postprocessing";

describe("LUT1DEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new LUT1DEffect());

	});

	it("can be disposed", () => {

		const object = new LUT1DEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
