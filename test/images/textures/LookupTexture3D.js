import test from "ava";
import { LookupTexture3D } from "../../../";

test("can be created", t => {

	t.truthy(new LookupTexture3D());

});
