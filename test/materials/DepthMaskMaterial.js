import test from "ava";
import { DepthMaskMaterial } from "../../";

test("can be created", t => {

	t.truthy(new DepthMaskMaterial());

});
