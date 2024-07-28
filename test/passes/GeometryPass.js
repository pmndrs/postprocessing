import test from "ava";
import { PerspectiveCamera, Scene } from "three";
import { GeometryPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new GeometryPass(new Scene(), new PerspectiveCamera());
	object.dispose();

	t.pass();

});
