import test from "ava";
import { LuminanceMaterial } from "../../build/postprocessing.umd.js";

test("can be created", t => {

	const object = new LuminanceMaterial();

	t.truthy(object);

});
