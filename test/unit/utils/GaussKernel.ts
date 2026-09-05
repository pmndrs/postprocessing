import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GaussKernel } from "postprocessing";

describe("GaussKernel", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => GaussKernel.create(9, 3));

	});

});
