import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GeometryPass } from "postprocessing";

describe("GeometryPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GeometryPass(null, null));

	});

	it("can be disposed", () => {

		const object = new GeometryPass(null, null);
		assert.doesNotThrow(() => object.dispose());

	});

});
