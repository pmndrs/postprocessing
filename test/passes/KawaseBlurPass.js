import test from "ava";
import { KawaseBlurPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new KawaseBlurPass();
	object.dispose();

	t.pass();

});
