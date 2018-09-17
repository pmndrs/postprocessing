import test from "ava";
import { ScanlineEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new ScanlineEffect();
	object.dispose();

	t.truthy(object);

});
