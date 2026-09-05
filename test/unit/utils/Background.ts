import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Background } from "postprocessing";

describe("Background", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Background());

	});

});
