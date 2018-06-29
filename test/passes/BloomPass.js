import test from "ava";
import { BloomPass } from "../../build/bundle.js";

test("can be created and destroyed", t => {

	const object = new BloomPass();
	object.dispose();

	t.truthy(object);

});
