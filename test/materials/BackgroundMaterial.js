import test from "ava";
import { BackgroundMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new BackgroundMaterial());

});
