import test from "ava";
import { KawaseUpsamplingMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new KawaseUpsamplingMaterial());

});
