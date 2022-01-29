import test from "ava";
import { AdaptiveLuminancePass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new AdaptiveLuminancePass();
	object.dispose();

	t.pass();

});
