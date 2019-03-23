import test from "ava";
import { BlendFunction, BlendMode } from "../../../build/postprocessing.js";

test("can be created", t => {

	const object = new BlendMode(BlendFunction.NORMAL);

	t.truthy(object);

});

test("can return shader code", t => {

	const object = new BlendMode(BlendFunction.NORMAL);

	t.truthy(object.getShaderCode());

});
