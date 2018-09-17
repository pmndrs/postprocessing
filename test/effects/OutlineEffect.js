import test from "ava";
import { OutlineEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new OutlineEffect(null, null);
	object.dispose();

	t.truthy(object);

});
