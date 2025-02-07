import test from "ava";
import { GaussianBlurPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new GaussianBlurPass();
	object.dispose();

	t.pass();

});
