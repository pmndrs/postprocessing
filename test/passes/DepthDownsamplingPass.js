import test from "ava";
import { DepthDownsamplingPass } from "../../";

test("can be created and destroyed", t => {

	const object = new DepthDownsamplingPass();
	object.dispose();

	t.pass();

});
