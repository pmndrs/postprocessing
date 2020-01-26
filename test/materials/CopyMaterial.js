import test from "ava";
import { CopyMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	t.truthy(new CopyMaterial());

});
