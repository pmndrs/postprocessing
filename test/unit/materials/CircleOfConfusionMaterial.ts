import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CircleOfConfusionMaterial } from "postprocessing";

describe("CircleOfConfusionMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new CircleOfConfusionMaterial());

	});

});
