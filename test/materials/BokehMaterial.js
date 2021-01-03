import test from "ava";
import { BokehMaterial } from "../../";

test("can be created", t => {

	t.truthy(new BokehMaterial());

});
