import test from "ava";
import { IOManager } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new IOManager());

});
