import test from "ava";
import { CombineMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new CombineMaterial();

	t.truthy(object);

});
