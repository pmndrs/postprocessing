import test from "ava";
import { TextureEffect } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new TextureEffect();
	object.dispose();

	t.truthy(object);

});
