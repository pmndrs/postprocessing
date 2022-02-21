import test from "ava";
import { DepthMaskMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new DepthMaskMaterial();
	t.pass();

});
