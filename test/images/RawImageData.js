import test from "ava";
import { RawImageData } from "../../";

test("can be created", t => {

	t.truthy(new RawImageData());

});
