import test from "ava";
import { GaussianBlurMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new GaussianBlurMaterial();
	t.pass();

});
