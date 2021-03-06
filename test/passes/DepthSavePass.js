import test from "ava";
import { DepthSavePass } from "../../";

test("can be created and destroyed", t => {

	const object = new DepthSavePass();
	object.dispose();

	t.pass();

});
