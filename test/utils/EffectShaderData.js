import test from "ava";
import { EffectShaderData, ToneMappingEffect } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new EffectShaderData());

});

test("can integrate effects", t => {

	const data = new EffectShaderData();
	const effect = new ToneMappingEffect();

	t.notThrows(() => data.integrateEffect("t", effect));

});

test("can accumulate data", t => {

	const data0 = new EffectShaderData();
	const data1 = new EffectShaderData();

	t.notThrows(() => data0.add(data1));

});
