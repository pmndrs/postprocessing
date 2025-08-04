import test from "ava";
import { LuminanceHighPassMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new LuminanceHighPassMaterial());

});
