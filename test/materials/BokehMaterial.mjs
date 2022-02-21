import test from "ava";
import { BokehMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new BokehMaterial();
	t.pass();

});
