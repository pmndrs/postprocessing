import test from "ava";
import { AdaptiveLuminosityMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new AdaptiveLuminosityMaterial();

	t.truthy(object);

});
