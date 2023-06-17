import test from "ava";
import { BokehMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new BokehMaterial());

});
