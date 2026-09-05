import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BackgroundMaterial } from "postprocessing";

describe("BackgroundMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new BackgroundMaterial());

	});

});
