import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LookupTexture } from "postprocessing";

describe("LookupTexture", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new LookupTexture(null, 1));

	});

});
