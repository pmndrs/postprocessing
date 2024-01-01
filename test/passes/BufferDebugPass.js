import test from "ava";
import { BufferDebugPass } from "postprocessing";

test("can be created and destroyed", t => {

	const object = new BufferDebugPass();
	object.dispose();

	t.pass();

});
