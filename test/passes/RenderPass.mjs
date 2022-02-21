import test from "ava";
import { RenderPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new RenderPass();
	object.dispose();

	t.pass();

});
