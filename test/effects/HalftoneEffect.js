import test from "ava";
import { HalftoneEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new HalftoneEffect();
	object.dispose();

	t.pass();

});
