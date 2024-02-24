import test from "ava";
import { NoiseTexture } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new NoiseTexture(1, 1));

});
