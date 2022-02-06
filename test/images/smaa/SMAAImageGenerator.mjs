import test from "ava";
import { SMAAImageGenerator } from "postprocessing";

test("can be created", t => {

	const object = new SMAAImageGenerator();
	t.pass();

});
