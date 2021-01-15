import test from "ava";
import { GlitchEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new GlitchEffect();
	object.dispose();

	t.pass();

});
