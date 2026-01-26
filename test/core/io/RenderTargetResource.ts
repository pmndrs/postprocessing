import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RenderTargetResource } from "postprocessing";

describe("RenderTargetResource", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new RenderTargetResource());

	});

});
