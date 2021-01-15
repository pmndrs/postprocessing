import test from "ava";
import { RealisticBokehEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new RealisticBokehEffect();
	object.dispose();

	t.pass();

});
