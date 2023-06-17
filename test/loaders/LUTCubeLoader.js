import test from "ava";
import { LUTCubeLoader } from "postprocessing";

test("can be created", t => {

	t.truthy(new LUTCubeLoader());

});
