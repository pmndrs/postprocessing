import test from "ava";
import { BlurPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new BlurPass();
	object.dispose();

	t.truthy(object);

});
