import test from "ava";
import { BrightnessContrastEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new BrightnessContrastEffect();
	object.dispose();

	t.pass();

});
