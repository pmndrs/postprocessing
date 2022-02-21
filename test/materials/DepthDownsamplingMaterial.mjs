import test from "ava";
import { DepthDownsamplingMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new DepthDownsamplingMaterial();
	t.pass();

});
