import test from "ava";
import { ClearFlags } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new ClearFlags());

});
