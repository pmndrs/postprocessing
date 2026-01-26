import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HalftoneEffect } from "postprocessing";

describe("HalftoneEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new HalftoneEffect());

	});

	it("can be disposed", () => {

		const object = new HalftoneEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
