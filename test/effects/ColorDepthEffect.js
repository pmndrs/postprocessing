import test from "ava";
import { ColorDepthEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new ColorDepthEffect();
	object.dispose();

	t.pass();

});
