import test from "ava";
import { BrightnessContrastEffect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new BrightnessContrastEffect();
	object.dispose();

	t.truthy(object);

});
