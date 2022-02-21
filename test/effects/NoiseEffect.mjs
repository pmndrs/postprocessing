import test from "ava";
import { NoiseEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new NoiseEffect();
	object.dispose();

	t.pass();

});
