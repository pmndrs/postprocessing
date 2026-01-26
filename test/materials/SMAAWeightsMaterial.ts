import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SMAAWeightsMaterial } from "postprocessing";

describe("SMAAWeightsMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new SMAAWeightsMaterial());

	});

});
