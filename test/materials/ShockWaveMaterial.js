import test from "ava";
import { ShockWaveMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new ShockWaveMaterial();

	t.truthy(object);

});
