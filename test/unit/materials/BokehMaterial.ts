import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BokehMaterial } from "postprocessing";

describe("BokehMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BokehMaterial());

	});

});
