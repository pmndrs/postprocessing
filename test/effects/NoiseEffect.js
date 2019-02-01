import test from "ava";
import { NoiseEffect } from "../../build/postprocessing.umd.js";

test("can be created and destroyed", t => {

	const object = new NoiseEffect();
	object.dispose();

	t.truthy(object);

});
