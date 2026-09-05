import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Scissor } from "postprocessing";

describe("Scissor", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Scissor());

	});

});
