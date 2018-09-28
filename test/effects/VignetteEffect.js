import test from "ava";
import { VignetteEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new VignetteEffect();
	object.dispose();

	t.truthy(object);

});
