import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RenderTargetResource } from "postprocessing";

describe("RenderTargetResource", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new RenderTargetResource());

	});

	it("resolves aliased resources to the same physical storage", () => {

		const first = new RenderTargetResource();
		const second = new RenderTargetResource();
		assert.notEqual(first, second);
		assert.notEqual(first.id, second.id);
		second.alias(first);
		assert.equal(first.storageId, second.storageId);

	});

});
