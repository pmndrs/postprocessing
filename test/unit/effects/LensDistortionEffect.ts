import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LensDistortionEffect } from "postprocessing";

describe("LensDistortionEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new LensDistortionEffect());

	});

	it("can be disposed", () => {

		const object = new LensDistortionEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
