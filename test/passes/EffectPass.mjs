import test from "ava";
import { DotScreenEffect, EffectPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new EffectPass(null);
	object.dispose();

	t.pass();

});

test("can create a compound shader material", t => {

	t.truthy(new EffectPass(null, new DotScreenEffect()));

});
