import test from "ava";
import { GreyscaleEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new GreyscaleEffect();
	object.dispose();

	t.truthy(object);

});
