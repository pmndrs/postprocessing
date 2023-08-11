import test from "ava";
import { GaussKernel } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new GaussKernel(3));

});
