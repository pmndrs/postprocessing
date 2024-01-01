import test from "ava";
import { BlendMode, SrcBlendFunction } from "postprocessing";

test("can be created", t => {

	t.truthy(new BlendMode(new SrcBlendFunction()));

});
