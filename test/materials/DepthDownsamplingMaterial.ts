import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DepthDownsamplingMaterial } from "postprocessing";

describe("DepthDownsamplingMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DepthDownsamplingMaterial());

	});

});
