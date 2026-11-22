import test from "ava";
import { HueSaturationEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new HueSaturationEffect();
	object.dispose();

	t.pass();

});

test("returns the hue it was set to, including negative angles", t => {

	const object = new HueSaturationEffect();

	for(const value of [-2.5, -0.5, 0, 0.5, 2.5]) {

		object.hue = value;
		t.true(Math.abs(object.hue - value) < 1e-6, `set ${value}, got ${object.hue}`);

	}

	object.dispose();

});
