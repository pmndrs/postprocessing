import test from "ava";
import { AdaptiveLuminanceMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new AdaptiveLuminanceMaterial());

});
