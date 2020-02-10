import test from "ava";
import { EffectComposer } from "../../build/postprocessing.esm.js";

test("can be instantiated and disposed", t => {

	const object = new EffectComposer();
	object.dispose();

	t.truthy(object);

});
