import test from "ava";
import { DotScreenMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new DotScreenMaterial();

	t.truthy(object);

});
