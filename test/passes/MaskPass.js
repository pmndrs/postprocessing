import test from "ava";
import { MaskPass } from "../../";

test("can be created and destroyed", t => {

	const object = new MaskPass();
	object.dispose();

	t.pass();

});
