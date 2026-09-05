import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FXAAEffect } from "postprocessing";

describe("FXAAEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new FXAAEffect());

	});

	it("can be disposed", () => {

		const object = new FXAAEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
