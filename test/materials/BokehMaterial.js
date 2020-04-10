import test from "ava";
import { BokehMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new BokehMaterial());

});
