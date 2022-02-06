import test from "ava";
import { SMAAImageLoader } from "postprocessing";

test("can be created", t => {

	const object = new SMAAImageLoader();
	t.pass();

});
