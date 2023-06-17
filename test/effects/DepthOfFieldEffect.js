import test from "ava";
import { DepthOfFieldEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DepthOfFieldEffect(null);
	object.dispose();

	t.pass();

});
