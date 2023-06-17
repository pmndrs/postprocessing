import test from "ava";
import { EdgeDetectionMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new EdgeDetectionMaterial());

});
