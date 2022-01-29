import test from "ava";
import { SavePass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new SavePass();
	object.dispose();

	t.pass();

});
