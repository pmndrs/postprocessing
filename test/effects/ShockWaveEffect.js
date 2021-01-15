import test from "ava";
import { ShockWaveEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new ShockWaveEffect(null);
	object.dispose();

	t.pass();

});
