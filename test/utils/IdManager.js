import test from "ava";
import { IdManager } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new IdManager());

});

test("returns unique IDs", t => {

	const manager = new IdManager();

	const id0 = manager.getNextId();
	const id1 = manager.getNextId();

	t.is(id0 !== id1, true);

});

test("can be reset", t => {

	const manager = new IdManager();

	const id0 = manager.getNextId();
	manager.reset();
	const id1 = manager.getNextId();

	t.is(id0 === id1, true);

});
