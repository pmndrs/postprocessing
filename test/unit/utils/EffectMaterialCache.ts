import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	EffectMaterialCache,
	type EffectPassContext,
	GBuffer,
	GBufferSchema,
	Input,
	ToneMappingEffect
} from "postprocessing";

function createContext(requiredTextures: readonly string[] = []): EffectPassContext {

	return {
		input: new Input(),
		requiredTextures
	};

}

describe("EffectMaterialCache", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new EffectMaterialCache(createContext()));

	});

	it("returns a material", () => {

		const manager = new EffectMaterialCache(createContext());
		assert.doesNotThrow(() => manager.getMaterial([]));

	});

	it("creates materials for all effect combinations", () => {

		const effects = [
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect()
		];

		effects.forEach((effect) => void (effect.optional = true));

		const context = createContext([GBuffer.COLOR]);
		context.input.setGBufferSchema(new GBufferSchema());

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

		const context = createContext([GBuffer.COLOR]);
		context.input.setGBufferSchema(new GBufferSchema());

		const manager = new EffectMaterialCache(context);

		assert.doesNotThrow(() => manager.getMaterial(effects));
		assert.equal(Array.from(manager.materials).length, 1);

	});

});
