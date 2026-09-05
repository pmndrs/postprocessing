import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Input } from "postprocessing";
import { Texture } from "three";

describe("Input", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new Input());

	});

	it("can set a default buffer", () => {

		const texture = new Texture();
		const input = new Input();

		input.defaultBuffer = texture;

		assert.equal(input.defaultBuffer?.value, texture);

	});

	it("can remove the default buffer", () => {

		const texture = new Texture();
		const input = new Input();

		input.defaultBuffer = texture;
		input.deleteDefaultBuffer();

		assert.equal(input.defaultBuffer, undefined);

	});

	it("can set a buffer", () => {

		const texture = new Texture();
		const input = new Input();

		input.setBuffer("test", texture);

		assert.equal(input.buffers.get("test")?.value, texture);

	});

	it("can remove a buffer", () => {

		const texture = new Texture();
		const input = new Input();

		input.setBuffer("test", texture);
		input.buffers.delete("test");

		assert.equal(input.buffers.get("test"), undefined);

	});

});
