import test from "ava";
import { EffectMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	t.truthy(new EffectMaterial(new Map(), null, null));

});
