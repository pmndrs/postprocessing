import test from "ava";
import { EffectComposer } from "postprocessing";

test("can be instantiated and disposed", t => {

	const object = new EffectComposer();
	object.dispose();

	t.pass();

});
