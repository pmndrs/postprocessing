import test from "ava";
import { LookupTexture } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new LookupTexture(null, 1, 1));

});
