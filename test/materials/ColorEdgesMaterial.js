import test from "ava";
import { ColorEdgesMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new ColorEdgesMaterial();

	t.truthy(object);

});
