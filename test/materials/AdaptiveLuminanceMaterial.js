import test from "ava";
import { AdaptiveLuminanceMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new AdaptiveLuminanceMaterial());

});
