import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ClearValues } from "postprocessing";

describe("ClearValues", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ClearValues());

	});

});
