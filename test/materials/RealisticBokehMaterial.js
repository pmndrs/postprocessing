import test from "ava";
import { RealisticBokehMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new RealisticBokehMaterial();

	t.truthy(object);

});
