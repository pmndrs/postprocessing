import test from "ava";
import { NoiseEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new NoiseEffect();
	object.dispose();

	t.pass();

});
