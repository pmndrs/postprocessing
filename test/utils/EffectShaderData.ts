import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EffectShaderData, ToneMappingEffect } from "postprocessing";

describe("EffectShaderData", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new EffectShaderData());

	});

	it("can integrate effects", () => {

		const data = new EffectShaderData();
		const effect = new ToneMappingEffect();

		assert.doesNotThrow(() => data.integrateEffect("t", effect));

	});

	it("can accumulate data", () => {

		const data0 = new EffectShaderData();
		const data1 = new EffectShaderData();

		assert.doesNotThrow(() => data0.add(data1));

	});

});
