import test from "ava";
import { MaskMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new MaskMaterial());

});
