import test from "ava";
import { LuminosityMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new LuminosityMaterial();

	t.truthy(object);

});
