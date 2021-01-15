import test from "ava";
import { HueSaturationEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new HueSaturationEffect();
	object.dispose();

	t.pass();

});
