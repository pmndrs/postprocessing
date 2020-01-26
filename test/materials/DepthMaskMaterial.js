import test from "ava";
import { DepthMaskMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	t.truthy(new DepthMaskMaterial());

});
