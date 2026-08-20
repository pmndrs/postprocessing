import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BoxBlurMaterial } from "postprocessing";

describe("BoxBlurMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BoxBlurMaterial());

	});

});
