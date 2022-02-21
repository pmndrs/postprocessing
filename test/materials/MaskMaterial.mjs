import test from "ava";
import { MaskMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new MaskMaterial();
	t.pass();

});
