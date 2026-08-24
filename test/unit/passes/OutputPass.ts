import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { OutputPass } from "postprocessing";

describe("OutputPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new OutputPass());

	});

	it("has no output buffer", () => {

		const pass = new OutputPass();
		assert.equal(pass.output.defaultBuffer, undefined);
		pass.dispose();

	});

});
