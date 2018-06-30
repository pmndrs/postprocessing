import test from "ava";
import { BokehPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new BokehPass();
	object.dispose();

	t.truthy(object);

});
