import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BackgroundMaterial } from "postprocessing";

describe("BackgroundMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BackgroundMaterial());

	});

});
