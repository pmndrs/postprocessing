import test from "ava";
import { ShockWavePass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new ShockWavePass(null);
	object.dispose();

	t.truthy(object);

});
