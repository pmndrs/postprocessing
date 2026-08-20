import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DepthPickingPass } from "postprocessing";

describe("DepthPickingPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new DepthPickingPass());

	});

	it("can be disposed", () => {

		const object = new DepthPickingPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
