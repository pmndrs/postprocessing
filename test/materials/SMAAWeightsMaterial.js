import test from "ava";
import { SMAAWeightsMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new SMAAWeightsMaterial();

	t.truthy(object);

});
