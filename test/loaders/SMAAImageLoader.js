import test from "ava";
import { SMAAImageLoader } from "postprocessing";

test("can be created", t => {

	t.truthy(new SMAAImageLoader());

});
