import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CopyPass } from "postprocessing";

describe("CopyPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new CopyPass());

	});

	it("can be disposed", () => {

		const object = new CopyPass();
		assert.doesNotThrow(() => object.dispose());

	});

});
