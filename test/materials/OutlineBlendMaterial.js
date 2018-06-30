import test from "ava";
import { OutlineBlendMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new OutlineBlendMaterial();

	t.truthy(object);

});
