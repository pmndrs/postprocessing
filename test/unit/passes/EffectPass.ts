import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EffectPass } from "postprocessing";

describe("EffectPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new EffectPass());

	});

	it("can be disposed", () => {

		const object = new EffectPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
