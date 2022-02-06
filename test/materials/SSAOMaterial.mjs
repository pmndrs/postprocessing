import test from "ava";
import { SSAOMaterial } from "postprocessing";

test("can be created", t => {

	const object = new SSAOMaterial();
	t.pass();

});
