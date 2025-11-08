import test from "ava";
import { PerspectiveCamera } from "three";
import { DepthOfFieldEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DepthOfFieldEffect(new PerspectiveCamera());
	object.dispose();

	t.pass();

});
