import test from "ava";
import { RenderPass } from "../../build/postprocessing.js";

test("can be created and destroyed", t => {

	const object = new RenderPass();
	object.dispose();

	t.truthy(object);

});
