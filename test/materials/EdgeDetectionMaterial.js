import test from "ava";
import { EdgeDetectionMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new EdgeDetectionMaterial());

});
