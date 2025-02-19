import test from "ava";
import { ASCIITexture } from "postprocessing";

test("can be instantiated", (t) => {
  t.truthy(new ASCIITexture());
});
