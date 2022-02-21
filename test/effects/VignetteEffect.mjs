import test from "ava";
import { VignetteEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new VignetteEffect();
	object.dispose();

	t.pass();

});
