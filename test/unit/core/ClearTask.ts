import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ClearTask } from "postprocessing";

describe("ClearTask", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ClearTask());

	});

	it("can be disposed", () => {

		const object = new ClearTask();
		assert.doesNotThrow(() => object.dispose());

	});

});
