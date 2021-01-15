import test from "ava";
import { SepiaEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new SepiaEffect();
	object.dispose();

	t.pass();

});
