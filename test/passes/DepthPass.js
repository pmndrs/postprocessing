import test from "ava";
import { DepthPass } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new DepthPass();
	object.dispose();

	t.truthy(object);

});
