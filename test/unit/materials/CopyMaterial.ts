import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CopyMaterial } from "postprocessing";

describe("CopyMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new CopyMaterial());

	});

});
