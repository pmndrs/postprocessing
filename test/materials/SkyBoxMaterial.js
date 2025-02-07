import test from "ava";
import { SkyBoxMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new SkyBoxMaterial());

});
