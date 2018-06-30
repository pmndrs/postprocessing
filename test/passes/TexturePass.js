import test from "ava";
import { TexturePass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new TexturePass();
	object.dispose();

	t.truthy(object);

});
