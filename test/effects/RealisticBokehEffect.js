import test from "ava";
import { RealisticBokehEffect } from "../../build/postprocessing.umd.js";

test("can be created and destroyed", t => {

	const object = new RealisticBokehEffect();
	object.dispose();

	t.truthy(object);

});
