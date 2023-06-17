import test from "ava";
import { DepthDownsamplingMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new DepthDownsamplingMaterial());

});
