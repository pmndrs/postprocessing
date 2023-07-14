import test from "ava";
import { LensDistortionEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new LensDistortionEffect();
	object.dispose();

	t.pass();

});
