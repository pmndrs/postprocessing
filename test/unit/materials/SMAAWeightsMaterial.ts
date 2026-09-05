import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SMAAWeightsMaterial } from "postprocessing";

describe("SMAAWeightsMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new SMAAWeightsMaterial());

	});

});
