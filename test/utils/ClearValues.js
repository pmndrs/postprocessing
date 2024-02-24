import test from "ava";
import { ClearValues } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new ClearValues());

});
