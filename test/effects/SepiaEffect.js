import test from "ava";
import { SepiaEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new SepiaEffect();
	object.dispose();

	t.truthy(object);

});
