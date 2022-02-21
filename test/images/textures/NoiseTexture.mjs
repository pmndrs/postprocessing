import test from "ava";
import { NoiseTexture } from "postprocessing/module";

test("can be created", t => {

	const object = new NoiseTexture(1, 1);
	t.pass();

});
