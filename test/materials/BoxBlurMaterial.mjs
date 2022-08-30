import test from "ava";
import { BoxBlurMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new BoxBlurMaterial();
	t.pass();

});
