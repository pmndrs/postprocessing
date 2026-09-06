import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ClearOperation } from "postprocessing";
import { createRenderTaskContext } from "../../support/context.ts";

describe("ClearOperation", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ClearOperation(createRenderTaskContext()));

	});

	it("can be disposed", () => {

		const object = new ClearOperation(createRenderTaskContext());
		assert.doesNotThrow(() => object.dispose());

	});

	it("accepts clear flag options", () => {

		const clear = new ClearOperation(createRenderTaskContext(), {
			color: false,
			depth: false,
			stencil: true
		});

		assert.equal(clear.clearFlags.color, false);
		assert.equal(clear.clearFlags.depth, false);
		assert.equal(clear.clearFlags.stencil, true);

	});

});
