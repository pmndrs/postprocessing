import test from "ava";
import { SMAAWeightsMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new SMAAWeightsMaterial());

});
