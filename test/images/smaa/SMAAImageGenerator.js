import test from "ava";
import { SMAAImageGenerator } from "postprocessing";

test("can be created", t => {

	t.truthy(new SMAAImageGenerator());

});
