import test from "ava";
import { ConvolutionMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new ConvolutionMaterial();

	t.truthy(object);

});
