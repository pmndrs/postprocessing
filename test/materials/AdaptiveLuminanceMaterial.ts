import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AdaptiveLuminanceMaterial } from "postprocessing";

describe("AdaptiveLuminanceMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new AdaptiveLuminanceMaterial());

	});

});
