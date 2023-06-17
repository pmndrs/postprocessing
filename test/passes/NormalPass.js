import test from "ava";
import { NormalPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new NormalPass();
	object.dispose();

	t.pass();

});
