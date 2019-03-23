import test from "ava";
import { BloomEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new BloomEffect();
	object.dispose();

	t.truthy(object);

});
