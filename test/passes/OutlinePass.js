import test from "ava";
import { OutlinePass } from "../../build/bundle.js";

test("can be created and destroyed", t => {

	const object = new OutlinePass(null, null);
	object.dispose();

	t.truthy(object);

});
