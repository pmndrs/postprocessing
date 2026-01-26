import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UpsamplingMaterial } from "postprocessing";

describe("UpsamplingMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new UpsamplingMaterial());

	});

});
