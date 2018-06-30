import test from "ava";
import { SavePass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new SavePass();
	object.dispose();

	t.truthy(object);

});
