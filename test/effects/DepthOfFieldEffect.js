import test from "ava";
import { DepthOfFieldEffect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new DepthOfFieldEffect(null);
	object.dispose();

	t.truthy(object);

});
