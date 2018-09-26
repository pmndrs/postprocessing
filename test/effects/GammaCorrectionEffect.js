import test from "ava";
import { GammaCorrectionEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new GammaCorrectionEffect();
	object.dispose();

	t.truthy(object);

});
