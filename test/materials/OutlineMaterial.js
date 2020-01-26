import test from "ava";
import { OutlineMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	t.truthy(new OutlineMaterial());

});
