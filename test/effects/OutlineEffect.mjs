import test from "ava";
import { OutlineEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new OutlineEffect(null, null);
	object.dispose();

	t.pass();

});
