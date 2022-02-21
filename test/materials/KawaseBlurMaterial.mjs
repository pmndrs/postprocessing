import test from "ava";
import { KawaseBlurMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new KawaseBlurMaterial();
	t.pass();

});
