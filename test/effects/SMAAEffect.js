import test from "ava";
import { SMAAEffect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new SMAAEffect();
	object.dispose();

	t.truthy(object);

});
