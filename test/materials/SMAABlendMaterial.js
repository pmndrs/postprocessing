import test from "ava";
import { SMAABlendMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new SMAABlendMaterial();

	t.truthy(object);

});
