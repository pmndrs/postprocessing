import test from "ava";
import { HueSaturationEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new HueSaturationEffect();
	object.dispose();

	t.pass();

});
