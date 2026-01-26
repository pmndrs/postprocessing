import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ASCIIEffect } from "postprocessing";

describe("ASCIIEffect", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ASCIIEffect({ asciiTexture: null }));

	});

	it("can be disposed", () => {

		const object = new ASCIIEffect({ asciiTexture: null });
		assert.doesNotThrow(() => object.dispose());

	});

});
