import test from "ava";
import { TiltShiftBlurMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new TiltShiftBlurMaterial());

});
