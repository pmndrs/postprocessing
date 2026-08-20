import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ColorDepthEffect } from "postprocessing";

describe("ColorDepthEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ColorDepthEffect());

	});

	it("can be disposed", () => {

		const object = new ColorDepthEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
