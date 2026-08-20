import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Input } from "postprocessing";

describe("Input", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Input());

	});

});
