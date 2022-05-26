import test from "ava";
import { LUT3DEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new LUT3DEffect(null);
	t.is(object.name, "LUT3DEffect");
	object.dispose();

	t.pass();

});
