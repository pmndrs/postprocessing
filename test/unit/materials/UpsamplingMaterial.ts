import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UpsamplingMaterial } from "postprocessing";

describe("UpsamplingMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new UpsamplingMaterial());

	});

});
