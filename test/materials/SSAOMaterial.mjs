import test from "ava";
import { SSAOMaterial } from "postprocessing/module";

test("can be created", t => {

	const object = new SSAOMaterial();
	t.pass();

});
