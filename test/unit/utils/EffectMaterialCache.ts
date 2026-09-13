import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EffectMaterialCache, GBuffer, GBufferSchema, ToneMappingEffect } from "postprocessing";
import { createEffectPassContext } from "../../support/context.ts";

describe("EffectMaterialCache", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new EffectMaterialCache(createEffectPassContext()));

	});

	it("returns a material", () => {

		const manager = new EffectMaterialCache(createEffectPassContext());
		assert.doesNotThrow(() => manager.getMaterial([]));

	});

	it("creates materials for all effect combinations", () => {

		const effects = [
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect()
		];

		effects.forEach((effect) => void (effect.optional = true));

		const context = createEffectPassContext([GBuffer.COLOR]);
		context.in.setGBufferSchema(new GBufferSchema());

		const manager = new EffectMaterialCache(context);

		assert.doesNotThrow(() => manager.getMaterial(effects));
		assert.equal(Array.from(manager.materials).length, 8 /* 2^3 */);

	});

	it("creates materials on demand if there are too many optional effects", () => {

		// The current limit for optional effects is 6 (64 materials)
		const effects = [
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect()
		];

		effects.forEach((effect) => void (effect.optional = true));

		const context = createEffectPassContext([GBuffer.COLOR]);
		context.in.setGBufferSchema(new GBufferSchema());

		const manager = new EffectMaterialCache(context);

		assert.doesNotThrow(() => manager.getMaterial(effects));
		assert.equal(Array.from(manager.materials).length, 1);

	});

});
