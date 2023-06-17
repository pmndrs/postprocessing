import test from "ava";
import { KawaseBlurMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new KawaseBlurMaterial());

});
