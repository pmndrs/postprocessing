import test from "ava";
import { Mesh } from "three";
import { GodRaysEffect } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new GodRaysEffect(null, new Mesh());
	object.dispose();

	t.pass();

});
