import test from "ava";
import { TiltShiftBlurPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new TiltShiftBlurPass();
	object.dispose();

	t.pass();

});
