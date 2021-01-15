import test from "ava";
import { PixelationEffect } from "../../";

test("can be created and destroyed", t => {

	const object = new PixelationEffect();
	object.dispose();

	t.pass();

});
