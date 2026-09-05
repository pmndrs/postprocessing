import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TiltShiftBlurMaterial } from "postprocessing";

describe("TiltShiftBlurMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new TiltShiftBlurMaterial());

	});

});
