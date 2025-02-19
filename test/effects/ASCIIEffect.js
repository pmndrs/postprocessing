import test from "ava";
import { ASCIIEffect } from "postprocessing";

test("can be created and destroyed", (t) => {
  const object = new ASCIIEffect();
  object.dispose();

  t.pass();
});
