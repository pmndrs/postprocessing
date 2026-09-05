import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NoiseTexture } from "postprocessing";

describe("NoiseTexture", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new NoiseTexture(1, 1));

	});

});
