import test from "ava";
import { TiltShiftEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new TiltShiftEffect();
	object.dispose();

	t.pass();

});

test("returns the rotation it was set to, including negative angles", t => {

	const object = new TiltShiftEffect();

	for(const value of [-2.5, -0.5, 0, 0.5, 2.5]) {

		object.rotation = value;
		t.true(Math.abs(object.rotation - value) < 1e-6, `set ${value}, got ${object.rotation}`);

	}

	object.dispose();

});
