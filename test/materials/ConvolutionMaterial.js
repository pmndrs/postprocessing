import test from "ava";
import { ConvolutionMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	t.truthy(new ConvolutionMaterial());

});
