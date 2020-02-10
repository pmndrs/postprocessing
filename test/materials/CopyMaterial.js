import test from "ava";
import { CopyMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new CopyMaterial());

});
