import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { IOManager } from "postprocessing";

describe("IOManager", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new IOManager());

	});

});
