import test from "ava";
import { AdaptiveLuminanceMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	t.truthy(new AdaptiveLuminanceMaterial());

});
