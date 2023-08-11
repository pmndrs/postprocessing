import test from "ava";
import { EffectPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new EffectPass();
	object.dispose();

	t.pass();

});
