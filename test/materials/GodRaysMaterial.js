import test from "ava";
import { GodRaysMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new GodRaysMaterial();

	t.truthy(object);

});
