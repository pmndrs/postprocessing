import test from "ava";
import { DepthCopyMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new DepthCopyMaterial();
	t.pass();

});
