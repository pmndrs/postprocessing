import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GBufferConfig } from "postprocessing";

describe("GBufferConfig", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GBufferConfig());

	});

});
