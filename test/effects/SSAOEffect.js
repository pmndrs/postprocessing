import test from "ava";
import { SSAOEffect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new SSAOEffect(null);
	object.dispose();

	t.truthy(object);

});
