import test from "ava";
import { OutlineMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new OutlineMaterial());

});
