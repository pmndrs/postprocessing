import test from "ava";
import { SepiaEffect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new SepiaEffect();
	object.dispose();

	t.truthy(object);

});
