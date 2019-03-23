import test from "ava";
import { ChromaticAberrationEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new ChromaticAberrationEffect();
	object.dispose();

	t.truthy(object);

});
