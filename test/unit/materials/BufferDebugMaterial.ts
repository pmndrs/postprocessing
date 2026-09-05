import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BufferDebugMaterial } from "postprocessing";

describe("BufferDebugMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BufferDebugMaterial());

	});

});
