import test from "ava";
import { CopyMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new CopyMaterial());

});
