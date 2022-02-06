import test from "ava";
import { SMAAWeightsMaterial } from "postprocessing";

test("can be created", t => {

	const object = new SMAAWeightsMaterial();
	t.pass();

});
