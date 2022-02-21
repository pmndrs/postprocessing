import test from "ava";
import { EffectMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new EffectMaterial(new Map(), null, null);
	t.pass();

});
