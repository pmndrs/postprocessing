import test from "ava";
import { KawaseDownsamplingMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new KawaseDownsamplingMaterial());

});
