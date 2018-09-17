import test from "ava";
import { DotScreenEffect, EffectPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new EffectPass(null);
	object.dispose();

	t.truthy(object);

});

test("can create a compound shader material", t => {

	const pass = new EffectPass(null, new DotScreenEffect());

	t.truthy(pass);

});
