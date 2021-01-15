import test from "ava";
import { ClearMaskPass } from "../../";

test("can be created and destroyed", t => {

	const object = new ClearMaskPass();
	object.dispose();

	t.pass();

});
