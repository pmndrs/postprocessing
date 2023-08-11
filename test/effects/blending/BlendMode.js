import test from "ava";
import { BlendFunction, BlendMode } from "postprocessing";

test("can be created", t => {

	t.truthy(new BlendMode());

});

test("can return shader code", t => {

	const blendMode = new BlendMode(BlendFunction.NORMAL);
	t.truthy(blendMode.shaderCode);

});
