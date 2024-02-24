import test from "ava";
import { ObservableMap } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new ObservableMap());

});
