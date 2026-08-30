import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RenderTargetResource } from "postprocessing";
import { TestPass } from "../../support/TestPass.ts";

describe("FrameGraph", () => {

	it("rejects passes that share the same target", () => {

		const shared = new RenderTargetResource();

		assert.doesNotThrow(() => new TestPass({ name: "First", target: shared }));
		assert.throws(() => new TestPass({ name: "Second", target: shared }));

	});

});
