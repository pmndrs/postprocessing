import test from "ava";
import { RenderPipeline } from "postprocessing";

test("can be instantiated and disposed", t => {

	const object = new RenderPipeline();
	object.dispose();

	t.pass();

});
