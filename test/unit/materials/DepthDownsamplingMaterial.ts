import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DepthDownsamplingMaterial } from "postprocessing";

describe("DepthDownsamplingMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DepthDownsamplingMaterial());

	});

});
