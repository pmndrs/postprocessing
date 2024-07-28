import test from "ava";
import { LookupTexture, LUT3DEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new LUT3DEffect(new LookupTexture(null, 1, 1));
	object.dispose();

	t.pass();

});
