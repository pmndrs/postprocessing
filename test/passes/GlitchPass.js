import test from "ava";
import { GlitchPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new GlitchPass();
	object.dispose();

	t.truthy(object);

});
