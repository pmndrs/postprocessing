import test from "ava";
import { Pass } from "../../";

test("can be created and destroyed", t => {

	const object = new Pass();
	object.dispose();

	t.pass();

});
