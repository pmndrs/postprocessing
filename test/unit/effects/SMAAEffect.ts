import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
