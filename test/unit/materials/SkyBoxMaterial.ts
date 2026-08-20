import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SkyBoxMaterial } from "postprocessing";

describe("SkyBoxMaterial", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new SkyBoxMaterial());

	});

});
