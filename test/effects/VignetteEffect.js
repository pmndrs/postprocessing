import test from "ava";
import { VignetteEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new VignetteEffect();
	object.dispose();

	t.pass();

});
