import test from "ava";
import { EffectMaterialManager, GBufferConfig, ToneMappingEffect } from "postprocessing";

const emptyShaderData = {
	uniforms: new Map(),
	defines: new Map()
};

test("can be instantiated", t => {

	t.truthy(new EffectMaterialManager());

});

test("returns a material", t => {

	const manager = new EffectMaterialManager();
	t.truthy(manager.getMaterial());

});

test("creates materials for all effect combinations", t => {

	const effects = [
		new ToneMappingEffect(),
		new ToneMappingEffect(),
		new ToneMappingEffect()
	];

	effects.forEach((effect) => void (effect.optional = true));

	const manager = new EffectMaterialManager(emptyShaderData);
	manager.gBufferConfig = new GBufferConfig();
	manager.effects = effects;

	t.truthy(manager.getMaterial());
	t.is(Array.from(manager.materials).length, 8 /* 2^3 */);

});

test("creates materials on demand if there are too many optional effects", t => {

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
	manager.gBufferConfig = new GBufferConfig();
	manager.effects = effects;

	t.truthy(manager.getMaterial());
	t.is(Array.from(manager.materials).length, 1);

});

test("can be disposed", t => {

	const manager = new EffectMaterialManager();
	manager.dispose();

	t.pass();

});
