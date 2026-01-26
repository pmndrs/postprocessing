import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EffectMaterialManager, GBuffer, GBufferConfig, ToneMappingEffect } from "postprocessing";

const emptyShaderData = {
	uniforms: new Map(),
	defines: new Map()
};

describe("EffectMaterialManager", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new EffectMaterialManager(emptyShaderData));

	});

	it("can be disposed", () => {

		const object = new EffectMaterialManager(emptyShaderData);
		assert.doesNotThrow(() => object.dispose());

	});

	it("returns a material", () => {

		const manager = new EffectMaterialManager(emptyShaderData);
		assert.doesNotThrow(() => manager.getMaterial([]));

	});

	it("creates materials for all effect combinations", () => {

		const effects = [
			new ToneMappingEffect(),
			new ToneMappingEffect(),
			new ToneMappingEffect()
		];

		effects.forEach((effect) => void (effect.optional = true));

		const manager = new EffectMaterialManager(emptyShaderData);
		manager.gBuffer = new Set([GBuffer.COLOR]);
		manager.gBufferConfig = new GBufferConfig();

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

		const manager = new EffectMaterialManager(emptyShaderData);
		manager.gBuffer = new Set([GBuffer.COLOR]);
		manager.gBufferConfig = new GBufferConfig();

		assert.doesNotThrow(() => manager.getMaterial(effects));
		assert.equal(Array.from(manager.materials).length, 1);

	});

});
