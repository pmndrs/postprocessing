import test from "ava";
import { DotScreenEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DotScreenEffect();
	object.dispose();

	t.pass();

});

test("returns the angle it was set to, including negative angles", t => {

	const object = new DotScreenEffect();

	for(const value of [-2.5, -0.5, 0, 0.5, 2.5]) {

		object.angle = value;
		t.true(Math.abs(object.angle - value) < 1e-6, `set ${value}, got ${object.angle}`);

	}

	object.dispose();

});
