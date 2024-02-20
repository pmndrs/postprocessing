import test from "ava";
import { ScanlineEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new ScanlineEffect();
	object.dispose();

	t.pass();

});
