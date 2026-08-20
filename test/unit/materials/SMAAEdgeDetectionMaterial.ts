import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SMAAEdgeDetectionMaterial } from "postprocessing";

describe("SMAAEdgeDetectionMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new SMAAEdgeDetectionMaterial());

	});

});
