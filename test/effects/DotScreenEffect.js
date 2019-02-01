import test from "ava";
import { DotScreenEffect } from "../../build/postprocessing.umd.js";

test("can be created and destroyed", t => {

	const object = new DotScreenEffect();
	object.dispose();

	t.truthy(object);

});
