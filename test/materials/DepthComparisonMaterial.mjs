import test from "ava";
import { DepthComparisonMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new DepthComparisonMaterial();
	t.pass();

});
