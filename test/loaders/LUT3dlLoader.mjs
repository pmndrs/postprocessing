import test from "ava";
import { LUT3dlLoader } from "postprocessing/module";

test("can be created", t => {

	const object = new LUT3dlLoader();
	t.pass();

});
