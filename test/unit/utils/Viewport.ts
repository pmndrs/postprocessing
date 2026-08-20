import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Viewport } from "postprocessing";

describe("Viewport", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Viewport());

	});

	it("properly applies pixel ratio", () => {

		const viewport = new Viewport();

		viewport.set(480, 270, 960, 540);
		viewport.pixelRatio = 2;

		assert.equal(viewport.width, 1920);
		assert.equal(viewport.height, 1080);
		assert.equal(viewport.offsetX, 960);
		assert.equal(viewport.offsetY, 540);

	});

});
