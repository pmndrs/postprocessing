import test from "ava";
import { GridEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new GridEffect();
	object.dispose();

	t.truthy(object);

});
