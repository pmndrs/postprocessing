import test from "ava";
import { GlitchMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new GlitchMaterial();

	t.truthy(object);

});
