import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GaussianBlurMaterial } from "postprocessing";

describe("GaussianBlurMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GaussianBlurMaterial());

	});

});
