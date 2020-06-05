import test from "ava";
import { DepthDownsamplingMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new DepthDownsamplingMaterial());

});
