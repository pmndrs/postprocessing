import test from "ava";
import { ChromaticAberrationEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new ChromaticAberrationEffect();
	object.dispose();

	t.pass();

});
