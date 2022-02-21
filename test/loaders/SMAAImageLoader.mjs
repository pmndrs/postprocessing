import test from "ava";
import { SMAAImageLoader } from "postprocessing/module";

test("can be created", t => {

	const object = new SMAAImageLoader();
	t.pass();

});
