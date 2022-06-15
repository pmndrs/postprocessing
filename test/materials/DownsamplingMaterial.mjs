import test from "ava";
import { DownsamplingMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new DownsamplingMaterial();
	t.pass();

});
