import test from "ava";
import { DepthCopyMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new DepthCopyMaterial());

});
