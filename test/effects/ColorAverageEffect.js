import test from "ava";
import { ColorAverageEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new ColorAverageEffect();
	object.dispose();

	t.pass();

});
