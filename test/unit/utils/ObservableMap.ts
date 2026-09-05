import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ObservableMap } from "postprocessing";

describe("ObservableMap", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ObservableMap());

	});

});
