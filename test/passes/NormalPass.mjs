import test from "ava";
import { NormalPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new NormalPass();
	object.dispose();

	t.pass();

});
