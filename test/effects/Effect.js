import test from "ava";
import { Effect } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new Effect();

	t.truthy(object);

});
