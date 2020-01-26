import test from "ava";
import { GodRaysMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	t.truthy(new GodRaysMaterial());

});
