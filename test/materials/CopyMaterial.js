import test from "ava";
import { CopyMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new CopyMaterial();

	t.truthy(object);

});
