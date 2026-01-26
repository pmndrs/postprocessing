import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LambdaPass } from "postprocessing";

describe("LambdaPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new LambdaPass(() => {}));

	});

	it("can be disposed", () => {

		const object = new LambdaPass(() => {});
		assert.doesNotThrow(() => object.dispose());

	});

});
