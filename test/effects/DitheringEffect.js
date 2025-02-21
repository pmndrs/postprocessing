import test from "ava";
import { DitheringEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DitheringEffect();
	object.dispose();

	t.pass();

});