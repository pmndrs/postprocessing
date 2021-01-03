import test from "ava";
import { ConvolutionMaterial } from "../../";

test("can be created", t => {

	t.truthy(new ConvolutionMaterial());

});
