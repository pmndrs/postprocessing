import test from "ava";
import { SSAOMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new SSAOMaterial());

});
