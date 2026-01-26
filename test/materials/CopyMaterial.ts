import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CopyMaterial } from "postprocessing";

describe("CopyMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new CopyMaterial());

	});

});
