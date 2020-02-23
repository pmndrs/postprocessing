import test from "ava";
import { CircleOfConfusionMaterial } from "../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new CircleOfConfusionMaterial());

});
