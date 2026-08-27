import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Output } from "postprocessing";

describe("Output", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Output());

	});

});
