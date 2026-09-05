import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BloomEffect } from "postprocessing";

describe("BloomEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BloomEffect());

	});

	it("can be disposed", () => {

		const object = new BloomEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
