import test from "ava";
import { ToneMappingEffect } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new ToneMappingEffect();
	object.dispose();

	t.pass();

});
