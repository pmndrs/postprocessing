import test from "ava";
import { BoxBlurMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new BoxBlurMaterial());

});
