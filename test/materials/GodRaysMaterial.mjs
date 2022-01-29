import test from "ava";
import { GodRaysMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new GodRaysMaterial());

});
