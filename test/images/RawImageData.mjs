import test from "ava";
import { RawImageData } from "postprocessing/module";

test("can be created", t => {

	const object = new RawImageData();
	t.pass();

});
