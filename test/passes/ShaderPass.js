import test from "ava";
import { ShaderPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new ShaderPass(null);
	object.dispose();

	t.truthy(object);

});
