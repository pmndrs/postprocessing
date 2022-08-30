import test from "ava";
import { BoxBlurPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new BoxBlurPass();
	object.dispose();

	t.pass();

});
