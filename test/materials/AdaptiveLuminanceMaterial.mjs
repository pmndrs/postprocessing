import test from "ava";
import { AdaptiveLuminanceMaterial } from "postprocessing";

test("can be created", t => {

	const object = new AdaptiveLuminanceMaterial();
	t.pass();

});
