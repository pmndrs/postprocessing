import test from "ava";
import { EffectMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new EffectMaterial(new Map(), null, null));

});
