import test from "ava";
import { RenderPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new RenderPass();
	object.dispose();

	t.pass();

});
