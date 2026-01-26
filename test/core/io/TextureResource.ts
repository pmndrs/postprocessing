import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TextureResource } from "postprocessing";
import { Texture, Uniform } from "three";

describe("TextureResource", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new TextureResource());

	});

	it("can bind uniforms", t => {

		const resource = new TextureResource();
		const uniform = new Uniform(null);
		const texture = new Texture();

		resource.bindUniform(uniform);
		resource.value = texture;

		assert.equal(uniform.value, resource.value);

	});

	it("can define an override value", t => {

		const texture0 = new Texture();
		const texture1 = new Texture();
		const resource = new TextureResource(texture0);
		resource.overrideValue = texture1;

		assert.equal(resource.value, texture1);

	});

});
