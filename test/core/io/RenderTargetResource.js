import test from "ava";
import { RenderTargetResource } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new RenderTargetResource());

});
