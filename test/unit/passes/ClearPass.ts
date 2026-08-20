import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ClearPass } from "postprocessing";

describe("ClearPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ClearPass());

	});

	it("can be disposed", () => {

		const object = new ClearPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
