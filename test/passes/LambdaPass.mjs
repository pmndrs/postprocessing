import test from "ava";
import { LambdaPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new LambdaPass(null);
	object.dispose();

	t.pass();

});
