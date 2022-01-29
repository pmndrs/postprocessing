import test from "ava";
import { ConvolutionMaterial } from "postprocessing";

test("can be created", t => {

	t.truthy(new ConvolutionMaterial());

});
