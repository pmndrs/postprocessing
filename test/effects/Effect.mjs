import test from "ava";
import { Effect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new Effect("Test", null);
	object.dispose();

	t.pass();

});
