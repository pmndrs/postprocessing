import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LuminancePass } from "postprocessing";

describe("LuminancePass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new LuminancePass());

	});

	it("can be disposed", () => {

		const object = new LuminancePass();
		assert.doesNotThrow(() => object.dispose());

	});

});
