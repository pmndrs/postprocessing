import test from "ava";
import { AdaptiveLuminanceMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new AdaptiveLuminanceMaterial();
	t.pass();

});
