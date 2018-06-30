import test from "ava";
import { GodRaysPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new GodRaysPass(null, null, null);
	object.dispose();

	t.truthy(object);

});
