import test from "ava";
import { BlendFunction, BlendMode } from "postprocessing/module";

test("can be created", t => {

	const object = new BlendMode(BlendFunction.NORMAL);
	t.pass();

});

test("can return shader code", t => {

	const object = new BlendMode(BlendFunction.NORMAL);
	t.pass();

});
