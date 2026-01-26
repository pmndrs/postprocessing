import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { IdManager } from "postprocessing";

describe("IdManager", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new IdManager());

	});

	it("returns unique IDs", () => {

		const manager = new IdManager();

		const id0 = manager.getNextId();
		const id1 = manager.getNextId();

		assert.equal(id0 !== id1, true);

	});

	it("can be reset", () => {

		const manager = new IdManager();

		const id0 = manager.getNextId();
		manager.reset();
		const id1 = manager.getNextId();

		assert.equal(id0 === id1, true);

	});

});
