import test from "ava";
import { SMAAImageLoader } from "../../../../build/postprocessing.esm.js";

test("can be created", t => {

	t.truthy(new SMAAImageLoader());

});
