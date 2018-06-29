import test from "ava";
import { DotScreenMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new DotScreenMaterial();

	t.truthy(object);

});
