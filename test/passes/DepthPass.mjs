import test from "ava";
import { DepthPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DepthPass();
	object.dispose();

	t.pass();

});
