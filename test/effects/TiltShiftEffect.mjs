import test from "ava";
import { TiltShiftEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new TiltShiftEffect();
	object.dispose();

	t.pass();

});
