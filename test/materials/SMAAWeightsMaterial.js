import test from "ava";
import { SMAAWeightsMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new SMAAWeightsMaterial());

});
