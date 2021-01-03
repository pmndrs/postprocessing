import test from "ava";
import { SMAAImageLoader } from "../../";

test("can be created", t => {

	t.truthy(new SMAAImageLoader());

});
