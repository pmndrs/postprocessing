import test from "ava";
import { EdgeDetectionMaterial } from "postprocessing";

test("can be created", t => {

	const object = new EdgeDetectionMaterial();
	t.pass();

});
