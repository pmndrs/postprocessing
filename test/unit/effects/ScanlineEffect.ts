import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ScanlineEffect } from "postprocessing";

describe("ScanlineEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ScanlineEffect());

	});

	it("can be disposed", () => {

		const object = new ScanlineEffect();
		assert.doesNotThrow(() => object.dispose());

	});

});
