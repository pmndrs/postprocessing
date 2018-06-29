import test from "ava";
import { ClearPass } from "../../build/bundle.js";

test("can be created and destroyed", t => {

	const object = new ClearPass();
	object.dispose();

	t.truthy(object);

});
