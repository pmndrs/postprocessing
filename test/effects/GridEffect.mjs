import test from "ava";
import { GridEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new GridEffect();
	object.dispose();

	t.pass();

});
