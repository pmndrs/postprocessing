import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ToneMappingEffect } from "postprocessing";

describe("ToneMappingEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ToneMappingEffect());

	});

	it("can be disposed", () => {

		const object = new ToneMappingEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
