import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TiltShiftBlurMaterial } from "postprocessing";

describe("TiltShiftBlurMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new TiltShiftBlurMaterial());

	});

});
