import test from "ava";
import { DepthMaskMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new DepthMaskMaterial());

});
