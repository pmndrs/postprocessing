import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TextureResource } from "postprocessing";
import { Texture, Uniform } from "three";

describe("TextureResource", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new TextureResource());

	});

	it("can bind uniforms", () => {

		const resource = new TextureResource();
		const uniform = new Uniform(null);
		const texture = new Texture();

		resource.bindUniform(uniform);
		resource.value = texture;

		assert.equal(uniform.value, resource.value);

	});

});
