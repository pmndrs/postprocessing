import test from "ava";
import { SelectiveBloomEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const scene = {
		background: null
	};

	const object = new SelectiveBloomEffect(scene, null);
	object.dispose();

	t.truthy(object);

});
