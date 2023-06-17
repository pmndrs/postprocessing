import test from "ava";
import { ClearMaskPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new ClearMaskPass();
	object.dispose();

	t.pass();

});
