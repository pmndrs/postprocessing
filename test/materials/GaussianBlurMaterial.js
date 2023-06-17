import test from "ava";
import { GaussianBlurMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new GaussianBlurMaterial());

});
