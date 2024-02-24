import test from "ava";
import { EffectShaderData } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new EffectShaderData());

});
