import assert from "node:assert/strict";
import { Texture } from "three";
import { describe, it } from "node:test";
import { EffectPass, GeometryPass, TextureEffect } from "postprocessing";

describe("EffectPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new EffectPass());

	});

	it("can be disposed", () => {

		const object = new EffectPass();
		assert.doesNotThrow(() => object.dispose());

	});

	it("preserves a TextureEffect's external texture when wired to a producer", () => {

		const texture = new Texture();
		const textureEffect = new TextureEffect({ texture });
		const geometryPass = new GeometryPass();
		const effectPass = new EffectPass(textureEffect);

		// The effect exposes its texture via the getter and registers it as an input buffer.
		assert.equal(textureEffect.texture, texture);
		assert.equal(textureEffect.in.textures.get("texture")?.value, texture);

		// Wiring the pass to a producer must not wipe the effect's own input buffer.
		effectPass.read(geometryPass);

		assert.equal(textureEffect.texture, texture);
		assert.equal(textureEffect.in.textures.get("texture")?.value, texture);

		effectPass.dispose();
		geometryPass.dispose();

	});

});
