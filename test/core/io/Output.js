import test from "ava";
import { Output } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new Output());

});
