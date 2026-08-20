import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BufferDebugPass } from "postprocessing";

describe("BufferDebugPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BufferDebugPass());

	});

	it("can be disposed", () => {

		const object = new BufferDebugPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
