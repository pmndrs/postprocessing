import test from "ava";
import { MaskPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new MaskPass();
	object.dispose();

	t.pass();

});
