import test from "ava";
import { MipmapBlurPass } from "postprocessing/module";

test("can be created and destroyed", t => {

	const object = new MipmapBlurPass();
	object.dispose();

	t.pass();

});
