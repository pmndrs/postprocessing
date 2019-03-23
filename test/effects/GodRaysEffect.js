import test from "ava";
import { GodRaysEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const lightSource = {
		material: {}
	};

	const object = new GodRaysEffect(null, lightSource);
	object.dispose();

	t.truthy(object);

});
