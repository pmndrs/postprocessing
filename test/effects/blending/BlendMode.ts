import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BlendMode, SrcBlendFunction } from "postprocessing";

describe("BlendMode", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BlendMode(new SrcBlendFunction()));

	});

});
