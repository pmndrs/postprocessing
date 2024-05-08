import test from "ava";
import { DualPassKawaseBlurPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new DualPassKawaseBlurPass();
	object.dispose();

	t.pass();

});
