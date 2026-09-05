import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Selection } from "postprocessing";

describe("Selection", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Selection());

	});

});
