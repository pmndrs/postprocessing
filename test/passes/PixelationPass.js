import test from "ava";
import { PixelationPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new PixelationPass();
	object.dispose();

	t.truthy(object);

});
