import test from "ava";
import { BloomEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new BloomEffect();
	object.dispose();

	t.pass();

});
