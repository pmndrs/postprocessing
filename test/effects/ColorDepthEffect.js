import test from "ava";
import { ColorDepthEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new ColorDepthEffect();
	object.dispose();

	t.truthy(object);

});
