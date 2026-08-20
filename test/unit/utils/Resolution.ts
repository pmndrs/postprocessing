import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Resolution } from "postprocessing";

describe("Resolution", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Resolution());

	});

	it("should use scale if width and height are both set to AUTO_SIZE", () => {

		const resolution = new Resolution();

		resolution.setBaseSize(1920, 1080);
		resolution.scale = 0.5;

		assert.equal(resolution.width, 960);
		assert.equal(resolution.height, 540);

	});

	it("should dispatch event when changing width or height", () => {

		const resolution = new Resolution();

		resolution.addEventListener("change", () => {

			assert.equal(resolution.baseWidth, 1920);
			assert.equal(resolution.baseHeight, 1080);

		});

		resolution.setBaseSize(1920, 1080);
		resolution.preferredWidth = Resolution.AUTO_SIZE;
		resolution.preferredHeight = 480;

	});

	it("properly calculates sizes when using AUTO_SIZE", () => {

		const resolution = new Resolution();

		const aspect = 1920 / 1080;
		resolution.setBaseSize(1920, 1080);

		resolution.preferredWidth = 512;
		resolution.preferredHeight = 256;

		assert.equal(resolution.width, 512);
		assert.equal(resolution.height, 256);

		resolution.preferredWidth = Resolution.AUTO_SIZE;
		resolution.preferredHeight = 480;

		assert.equal(resolution.width, Math.round(480 * aspect));

		resolution.preferredWidth = 720;
		resolution.preferredHeight = Resolution.AUTO_SIZE;

		assert.equal(resolution.height, Math.round(720 / aspect));

	});

	it("properly applies pixel ratio", () => {

		const resolution = new Resolution();

		resolution.setBaseSize(960, 540);
		resolution.pixelRatio = 2;

		assert.equal(resolution.width, 1920);
		assert.equal(resolution.height, 1080);

	});

});
