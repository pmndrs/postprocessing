import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TextureEffect } from "postprocessing";

describe("TextureEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new TextureEffect());

	});

	it("can be disposed", () => {

		const object = new TextureEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
