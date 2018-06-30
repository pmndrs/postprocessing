import test from "ava";
import { GodRaysMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new GodRaysMaterial();

	t.truthy(object);

});
