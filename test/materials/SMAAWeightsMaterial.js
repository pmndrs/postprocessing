import test from "ava";
import { SMAAWeightsMaterial } from "../../";

test("can be created", t => {

	t.truthy(new SMAAWeightsMaterial());

});
