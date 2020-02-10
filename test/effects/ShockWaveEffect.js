import test from "ava";
import { ShockWaveEffect } from "../../build/postprocessing.esm.js";

test("can be created and destroyed", t => {

	const object = new ShockWaveEffect(null);
	object.dispose();

	t.truthy(object);

});
