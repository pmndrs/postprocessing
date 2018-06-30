import test from "ava";
import { ConvolutionMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new ConvolutionMaterial();

	t.truthy(object);

});
