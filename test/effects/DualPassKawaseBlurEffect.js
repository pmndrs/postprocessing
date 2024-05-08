import test from "ava";
import { DualPassKawaseBlurEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DualPassKawaseBlurEffect();
	object.dispose();

	t.pass();

});
