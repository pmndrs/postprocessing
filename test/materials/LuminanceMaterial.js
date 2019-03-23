import test from "ava";
import { LuminanceMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new LuminanceMaterial();

	t.truthy(object);

});
