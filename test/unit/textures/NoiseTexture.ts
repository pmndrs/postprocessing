import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RGBAFormat, UnsignedByteType } from "three";
import { NoiseTexture } from "postprocessing";

describe("NoiseTexture", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new NoiseTexture(1, 1));

	});

	it("is deterministic for a given seed", () => {

		const a = new NoiseTexture(4, 4, RGBAFormat, UnsignedByteType, 1);
		const b = new NoiseTexture(4, 4, RGBAFormat, UnsignedByteType, 1);
		assert.deepEqual(a.image.data, b.image.data);

		const c = new NoiseTexture(4, 4, RGBAFormat, UnsignedByteType, 2);
		assert.notDeepEqual(a.image.data, c.image.data);

	});

});
