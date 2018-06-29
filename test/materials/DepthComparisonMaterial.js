import test from "ava";
import { DepthComparisonMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new DepthComparisonMaterial();

	t.truthy(object);

});
