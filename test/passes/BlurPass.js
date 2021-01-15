import test from "ava";
import { BlurPass } from "../../";

test("can be created and destroyed", t => {

	const object = new BlurPass();
	object.dispose();

	t.pass();

});
