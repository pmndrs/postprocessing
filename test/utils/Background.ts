import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Background } from "postprocessing";

describe("Background", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Background());

	});

});
