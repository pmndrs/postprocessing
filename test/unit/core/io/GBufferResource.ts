import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GBufferResource } from "postprocessing";

describe("GBufferResource", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GBufferResource());

	});

});
