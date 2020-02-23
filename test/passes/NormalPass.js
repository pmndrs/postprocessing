import test from "ava";
import { NormalPass } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new NormalPass();
	object.dispose();

	t.truthy(object);

});
