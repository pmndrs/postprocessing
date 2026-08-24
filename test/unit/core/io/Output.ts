import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Output } from "postprocessing";

describe("Output", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Output());

	});

	it("can create a default buffer", () => {

		const output = new Output();
		output.createDefaultBuffer();

		assert.notEqual(output.defaultBuffer, undefined);

	});

	it("can remove the default buffer", () => {

		const output = new Output();
		output.createDefaultBuffer();
		output.removeDefaultBuffer();

		assert.equal(output.defaultBuffer, undefined);

	});

});
