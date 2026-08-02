import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GBufferSchema } from "postprocessing";

describe("GBufferSchema", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GBufferSchema());

	});

});
