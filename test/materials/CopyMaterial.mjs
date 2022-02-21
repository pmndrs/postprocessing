import test from "ava";
import { CopyMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new CopyMaterial();
	t.pass();

});
