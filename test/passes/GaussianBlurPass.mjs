import test from "ava";
import { GaussianBlurPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new GaussianBlurPass();
	object.dispose();

	t.pass();

});
