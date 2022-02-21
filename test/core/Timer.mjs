import test from "ava";
import { Timer } from "postprocessing/module";

test("can be instantiated", t => {

	t.truthy(new Timer());

});
