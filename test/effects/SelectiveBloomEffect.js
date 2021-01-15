import test from "ava";
import { SelectiveBloomEffect } from "../../";

test("can be created and destroyed", t => {

	const scene = {
		background: null
	};

	const object = new SelectiveBloomEffect(scene, null);
	object.dispose();

	t.pass();

});
