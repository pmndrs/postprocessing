import test from "ava";
import { LambdaPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new LambdaPass(null);
	object.dispose();

	t.pass();

});
