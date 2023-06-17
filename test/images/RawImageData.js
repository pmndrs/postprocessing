import test from "ava";
import { RawImageData } from "postprocessing";

test("can be created", t => {

	t.truthy(new RawImageData());

});
