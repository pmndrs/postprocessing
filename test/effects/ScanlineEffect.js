import test from "ava";
import { ScanlineEffect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new ScanlineEffect();
	object.dispose();

	t.truthy(object);

});
