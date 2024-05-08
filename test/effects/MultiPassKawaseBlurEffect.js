import test from "ava";
import { MultiPassKawaseBlurEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new MultiPassKawaseBlurEffect();
	object.dispose();

	t.pass();

});
