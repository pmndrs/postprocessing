import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { VignetteEffect } from "postprocessing";

describe("VignetteEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new VignetteEffect());

	});

	it("can be disposed", () => {

		const object = new VignetteEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
