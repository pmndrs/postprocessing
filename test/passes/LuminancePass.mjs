import test from "ava";
import { LuminancePass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new LuminancePass();
	object.dispose();

	t.pass();

});
