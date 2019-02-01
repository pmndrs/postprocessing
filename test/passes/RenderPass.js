import test from "ava";
import { RenderPass } from "../../build/postprocessing.umd.js";

test("can be created and destroyed", t => {

	const object = new RenderPass();
	object.dispose();

	t.truthy(object);

});
