import test from "ava";
import { SMAAEdgeDetectionMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new SMAAEdgeDetectionMaterial());

});
