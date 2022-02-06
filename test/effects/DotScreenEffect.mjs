import test from "ava";
import { DotScreenEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DotScreenEffect();
	object.dispose();

	t.pass();

});
