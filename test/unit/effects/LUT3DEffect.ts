import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LUT3DEffect } from "postprocessing";

describe("LUT3DEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new LUT3DEffect());

	});

	it("can be disposed", () => {

		const object = new LUT3DEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
