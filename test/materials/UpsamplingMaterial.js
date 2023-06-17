import test from "ava";
import { UpsamplingMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new UpsamplingMaterial());

});
