import test from "ava";
import { FXAAEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new FXAAEffect();
	object.dispose();

	t.pass();

});
