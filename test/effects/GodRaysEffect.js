import test from "ava";
import { GodRaysEffect } from "../../build/postprocessing.umd.js";

test("can be created and destroyed", t => {

	const object = new GodRaysEffect(null, null, null);
	object.dispose();

	t.truthy(object);

});
