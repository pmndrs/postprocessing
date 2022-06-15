import test from "ava";
import { UpsamplingMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new UpsamplingMaterial();
	t.pass();

});
