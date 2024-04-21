import { LensDistortionEffect } from "postprocessing";
import test from "ava";

test("can be created and destroyed", (t) => {

	const object = new LensDistortionEffect();
	object.dispose();

	t.pass();

});
