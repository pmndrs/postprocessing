import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MipmapBlurPass } from "postprocessing";

describe("MipmapBlurPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new MipmapBlurPass());

	});

	it("can be disposed", () => {

		const object = new MipmapBlurPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
