import test from "ava";
import { Texture } from "three";
import { EffectPass, TextureEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new TextureEffect();
	object.dispose();

	t.pass();

});

test("can be updated", t => {

	const effect = new TextureEffect();
	t.notThrows(() => effect.update());

});

test("can clear an existing texture", t => {

	const effect = new TextureEffect({ texture: new Texture() });
	t.notThrows(() => { effect.texture = null; });
	t.is(effect.texture, null);

});

test("recompiles its host pass after clearing an existing texture", t => {

	const texture = new Texture();
	texture.matrixAutoUpdate = true;

	const effect = new TextureEffect({ texture });
	const pass = new EffectPass(null, effect);
	pass.initialize(null, false, undefined);

	t.true(pass.fullscreenMaterial.vertexShader.includes("UvTransform"));

	t.notThrows(() => { effect.texture = null; });

	t.false(pass.fullscreenMaterial.vertexShader.includes("UvTransform"));

});
