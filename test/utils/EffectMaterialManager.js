import test from "ava";
import { EffectMaterialManager } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new EffectMaterialManager());

});

test("returns a material", t => {

	const manager = new EffectMaterialManager();
	t.truthy(manager.getMaterial());

});

test("can be disposed", t => {

	const manager = new EffectMaterialManager();
	manager.dispose();

	t.pass();

});
