import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ClearFlags } from "postprocessing";

describe("ClearFlags", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ClearFlags());

	});

});
