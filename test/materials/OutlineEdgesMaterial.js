import test from "ava";
import { OutlineEdgesMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new OutlineEdgesMaterial();

	t.truthy(object);

});
