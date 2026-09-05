import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DepthCopyPass } from "postprocessing";

describe("DepthCopyPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DepthCopyPass());

	});

	it("can be disposed", () => {

		const object = new DepthCopyPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
