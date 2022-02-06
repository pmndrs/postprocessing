import test from "ava";
import { CopyPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new CopyPass();
	object.dispose();

	t.pass();

});
