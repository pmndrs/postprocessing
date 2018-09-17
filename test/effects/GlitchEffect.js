import test from "ava";
import { GlitchEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new GlitchEffect();
	object.dispose();

	t.truthy(object);

});
