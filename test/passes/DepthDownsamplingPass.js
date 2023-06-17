import test from "ava";
import { DepthDownsamplingPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DepthDownsamplingPass();
	object.dispose();

	t.pass();

});
