import test from "ava";
import { PixelationEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new PixelationEffect();
	object.dispose();

	t.truthy(object);

});
