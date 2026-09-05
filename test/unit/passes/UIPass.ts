import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EffectPass, GBuffer, GeometryPass, UIPass } from "postprocessing";

describe("UIPass", () => {

	it("does not require input textures", () => {

		const pass = new UIPass();

		assert.deepEqual(pass.requiredTextures, []);

		pass.dispose();

	});

	it("keeps geometry depth when its color input is replaced", () => {

		const geometryPass = new GeometryPass();
		const effectPass = new EffectPass();
		const uiPass = new UIPass();
		const depth = geometryPass.output.defaultBuffer!.textures.get(GBuffer.DEPTH);

		uiPass.read(geometryPass);
		uiPass.read(effectPass);

		assert.equal(uiPass.input.defaultBuffer, effectPass.output.defaultBuffer!.texture);
		assert.equal(uiPass.input.buffers.get(GBuffer.DEPTH), depth);

		geometryPass.dispose();
		effectPass.dispose();
		uiPass.dispose();

	});

});
