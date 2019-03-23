import test from "ava";
import { CopyMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new CopyMaterial();

	t.truthy(object);

});
