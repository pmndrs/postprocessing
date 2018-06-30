import test from "ava";
import { BokehMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new BokehMaterial();

	t.truthy(object);

});
