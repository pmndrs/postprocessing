import test from "ava";
import { Texture } from "three";
import { LUT1DEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new LUT1DEffect(new Texture());
	object.dispose();

	t.pass();

});
