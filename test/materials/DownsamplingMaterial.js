import test from "ava";
import { DownsamplingMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new DownsamplingMaterial());

});
