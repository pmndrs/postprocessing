import test from "ava";
import { GaussKernel } from "postprocessing/module";

test("can be instantiated", t => {

	t.truthy(new GaussKernel(3));

});
