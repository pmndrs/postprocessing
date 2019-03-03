import test from "ava";
import { DepthMaskMaterial } from "../../build/postprocessing.umd.js";

test("can be created", t => {

	const object = new DepthMaskMaterial();

	t.truthy(object);

});
