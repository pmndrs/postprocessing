import test from "ava";
import { PixelationMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new PixelationMaterial();

	t.truthy(object);

});
