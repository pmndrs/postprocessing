import test from "ava";
import { SMAAEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new SMAAEffect();
	object.dispose();

	t.pass();

});
