import test from "ava";
import { LuminanceMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new LuminanceMaterial());

});
