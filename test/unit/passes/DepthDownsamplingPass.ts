import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DepthDownsamplingPass } from "postprocessing";

describe("DepthDownsamplingPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DepthDownsamplingPass());

	});

	it("can be disposed", () => {

		const object = new DepthDownsamplingPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
