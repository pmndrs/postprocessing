import test from "ava";
import { CombineMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new CombineMaterial();

	t.truthy(object);

});
