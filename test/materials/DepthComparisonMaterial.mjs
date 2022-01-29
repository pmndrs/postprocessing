import test from "ava";
import { DepthComparisonMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new DepthComparisonMaterial());

});
