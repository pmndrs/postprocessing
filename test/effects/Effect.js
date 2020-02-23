import test from "ava";
import { Effect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new Effect("Test", null);
	object.dispose();

	t.truthy(object);

});
