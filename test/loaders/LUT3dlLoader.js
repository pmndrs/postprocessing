import test from "ava";
import { LUT3dlLoader } from "postprocessing";

test("can be created", t => {

	t.truthy(new LUT3dlLoader());

});
