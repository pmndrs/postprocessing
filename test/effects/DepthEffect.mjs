import test from "ava";
import { DepthEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DepthEffect();
	object.dispose();

	t.pass();

});
