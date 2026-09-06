import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FullscreenRenderOperation } from "postprocessing";
import { createRenderTaskContext } from "../../support/context.ts";

describe("FullscreenRenderOperation", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new FullscreenRenderOperation(createRenderTaskContext()));

	});

	it("can be disposed", () => {

		const object = new FullscreenRenderOperation(createRenderTaskContext());
		assert.doesNotThrow(() => object.dispose());

	});

});
