import test from "ava";
import { GBufferConfig } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new GBufferConfig());

});
