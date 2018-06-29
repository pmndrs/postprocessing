import test from "ava";
import { ToneMappingPass } from "../../build/bundle.js";

test("can be created and destroyed", t => {

	const object = new ToneMappingPass();
	object.dispose();

	t.truthy(object);

});
