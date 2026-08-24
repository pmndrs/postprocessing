import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ClearOperation } from "postprocessing";
import type { RenderTaskContext } from "postprocessing";

function createContext(): RenderTaskContext {

	return {
		renderer: null,
		scene: null,
		camera: null
	};

}

describe("ClearOperation", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ClearOperation(createContext()));

	});

	it("accepts clear flag options", () => {

		const object = new ClearOperation(createContext(), {
			color: false,
			depth: false,
			stencil: true
		});

		assert.equal(object.clearFlags.color, false);
		assert.equal(object.clearFlags.depth, false);
		assert.equal(object.clearFlags.stencil, true);

	});

	it("can be disposed", () => {

		const object = new ClearOperation(createContext());
		assert.doesNotThrow(() => object.dispose());

	});

});
