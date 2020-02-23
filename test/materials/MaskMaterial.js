import test from "ava";
import { MaskMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new MaskMaterial());

});
