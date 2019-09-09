import test from "ava";
import { Selection } from "../../build/postprocessing.js";

test("can be instantiated", t => {

	const object = new Selection();

	t.truthy(object);

});
