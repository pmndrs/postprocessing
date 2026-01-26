import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DepthCopyMaterial } from "postprocessing";

describe("DepthCopyMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DepthCopyMaterial());

	});

});
