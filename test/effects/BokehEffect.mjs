import test from "ava";
import { BokehEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new BokehEffect();
	object.dispose();

	t.pass();

});
