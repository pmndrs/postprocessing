import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { KawaseBlurMaterial } from "postprocessing";

describe("KawaseBlurMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new KawaseBlurMaterial());

	});

});
