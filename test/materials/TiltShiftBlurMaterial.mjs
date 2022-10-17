import test from "ava";
import { TiltShiftBlurMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new TiltShiftBlurMaterial();
	t.pass();

});
