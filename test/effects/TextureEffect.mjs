import test from "ava";
import { TextureEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new TextureEffect();
	object.dispose();

	t.pass();

});
