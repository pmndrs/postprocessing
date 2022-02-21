import test from "ava";
import { DepthPickingPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new DepthPickingPass();
	object.dispose();

	t.pass();

});
