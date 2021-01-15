import test from "ava";
import { OverrideMaterialManager } from "../../";

test("can be instantiated and disposed", t => {

	const object = new OverrideMaterialManager();
	object.dispose();

	t.pass();

});

test("has a workaround that can be enabled and disabled", t => {

	OverrideMaterialManager.workaroundEnabled = true;
	t.is(OverrideMaterialManager.workaroundEnabled, true);

	OverrideMaterialManager.workaroundEnabled = false;
	t.is(OverrideMaterialManager.workaroundEnabled, false);

});
