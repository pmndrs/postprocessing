import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SMAAEdgeDetectionMaterial } from "postprocessing";

describe("SMAAEdgeDetectionMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new SMAAEdgeDetectionMaterial());

	});

});
