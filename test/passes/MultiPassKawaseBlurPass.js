import test from "ava";
import { MultiPassKawaseBlurPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new MultiPassKawaseBlurPass();
	object.dispose();

	t.pass();

});
