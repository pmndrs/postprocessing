import test from "ava";
import { SMAAWeightsMaterial } from "../../build/postprocessing.umd.js";

test("can be created", t => {

	const object = new SMAAWeightsMaterial();

	t.truthy(object);

});
