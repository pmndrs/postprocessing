import test from "ava";
import { SMAAImageGenerator } from "postprocessing/module";

test("can be created", t => {

	const object = new SMAAImageGenerator();
	t.pass();

});
