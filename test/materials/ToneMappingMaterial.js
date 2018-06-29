import test from "ava";
import { ToneMappingMaterial } from "../../build/bundle.js";

test("can be created", t => {

	const object = new ToneMappingMaterial();

	t.truthy(object);

});
