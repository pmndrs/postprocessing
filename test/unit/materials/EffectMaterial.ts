import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EffectMaterial } from "postprocessing";

describe("EffectMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new EffectMaterial());

	});

});
