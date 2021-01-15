import test from "ava";
import { GridEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new GridEffect();
	object.dispose();

	t.pass();

});
