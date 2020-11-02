import test from "ava";
import { LambdaPass } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new LambdaPass(null);
	object.dispose();

	t.truthy(object);

});
