import test from "ava";
import { MaskPass } from "../../build/postprocessing.umd.js";

test("can be created and destroyed", t => {

	const object = new MaskPass();
	object.dispose();

	t.truthy(object);

});
