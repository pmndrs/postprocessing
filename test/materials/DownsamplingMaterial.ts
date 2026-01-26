import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DownsamplingMaterial } from "postprocessing";

describe("DownsamplingMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DownsamplingMaterial());

	});

});
