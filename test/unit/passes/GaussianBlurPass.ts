import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GaussianBlurPass } from "postprocessing";

describe("GaussianBlurPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GaussianBlurPass());

	});

	it("can be disposed", () => {

		const object = new GaussianBlurPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
