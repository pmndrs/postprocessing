import test from "ava";
import { DepthDownsamplingMaterial } from "../../";

test("can be created", t => {

	t.truthy(new DepthDownsamplingMaterial());

});
