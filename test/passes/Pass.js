import test from "ava";
import { Pass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new Pass();
	object.dispose();

	t.truthy(object);

});
