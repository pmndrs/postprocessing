import test from "ava";
import { LUT1DEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new LUT1DEffect(null);
	t.is(object.name, "LUT1DEffect");
	object.dispose();

	t.pass();

});
