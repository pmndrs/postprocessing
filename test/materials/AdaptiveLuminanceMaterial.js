import test from "ava";
import { AdaptiveLuminanceMaterial } from "../../build/postprocessing.umd.js";

test("can be created", t => {

	const object = new AdaptiveLuminanceMaterial();

	t.truthy(object);

});
