import test from "ava";
import { BloomPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new BloomPass();
	object.dispose();

	t.truthy(object);

});
