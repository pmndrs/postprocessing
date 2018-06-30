import test from "ava";
import { GlitchMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new GlitchMaterial();

	t.truthy(object);

});
