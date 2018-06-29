import test from "ava";
import { BlurPass } from "../../build/bundle.js";

test("can be created and destroyed", t => {

	const object = new BlurPass();
	object.dispose();

	t.truthy(object);

});
