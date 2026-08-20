import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GaussKernel } from "postprocessing";

describe("GaussKernel", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GaussKernel(3));

	});

});
