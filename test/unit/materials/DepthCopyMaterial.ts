import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DepthCopyMaterial } from "postprocessing";

describe("DepthCopyMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DepthCopyMaterial());

	});

});
