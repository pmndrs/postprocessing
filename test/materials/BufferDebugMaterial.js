import test from "ava";
import { BufferDebugMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new BufferDebugMaterial());

});
