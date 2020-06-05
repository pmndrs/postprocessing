import test from "ava";
import { SSAOMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new SSAOMaterial());

});
