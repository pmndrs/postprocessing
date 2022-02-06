import test from "ava";
import { EffectMaterial } from "postprocessing";

test("can be created", t => {

	const object = new EffectMaterial(new Map(), null, null);
	t.pass();

});
