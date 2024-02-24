import test from "ava";
import { TextureResource } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new TextureResource());

});
