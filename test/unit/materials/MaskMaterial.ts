import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MaskMaterial } from "postprocessing";

describe("MaskMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new MaskMaterial());

	});

});
