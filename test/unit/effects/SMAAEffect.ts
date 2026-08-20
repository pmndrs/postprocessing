import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SMAAEffect } from "postprocessing";

describe("SMAAEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new SMAAEffect());

	});

	it("can be disposed", () => {

		const object = new SMAAEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
