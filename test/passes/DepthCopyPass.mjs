import test from "ava";
import { DepthCopyPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new DepthCopyPass();
	object.dispose();

	t.pass();

});
