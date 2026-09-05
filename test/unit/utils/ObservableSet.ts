import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ObservableSet } from "postprocessing";

describe("ObservableSet", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ObservableSet());

	});

});
