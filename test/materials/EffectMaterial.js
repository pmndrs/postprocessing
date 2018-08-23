import test from "ava";
import { EffectMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new EffectMaterial(null, null, null);

	t.truthy(object);

});
