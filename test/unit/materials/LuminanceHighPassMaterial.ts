import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LuminanceHighPassMaterial } from "postprocessing";

describe("LuminanceHighPassMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new LuminanceHighPassMaterial());

	});

});
