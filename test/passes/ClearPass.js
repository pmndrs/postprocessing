import test from "ava";
import { ClearPass } from "../../";

test("can be created and destroyed", t => {

	const object = new ClearPass();
	object.dispose();

	t.pass();

});
