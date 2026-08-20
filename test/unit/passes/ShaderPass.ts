import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShaderPass } from "postprocessing";
import { ShaderMaterial } from "three";

describe("ShaderPass", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new ShaderPass(new ShaderMaterial()));

	});

	it("can be disposed", () => {

		const object = new ShaderPass(new ShaderMaterial());
		assert.doesNotThrow(() => object.dispose());

	});

});
