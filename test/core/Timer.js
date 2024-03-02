import test from "ava";
import { Timer } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new Timer());

});
