import test from "ava";
import { ObservableSet } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new ObservableSet());

});
