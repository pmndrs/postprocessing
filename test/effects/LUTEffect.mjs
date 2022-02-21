import test from "ava";
import { LUTEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new LUTEffect(null);
	object.dispose();

	t.pass();

});
