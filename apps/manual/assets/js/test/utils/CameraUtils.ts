import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateHorizontalFoV, calculateVerticalFoV } from "../../src/utils/CameraUtils.ts";

describe("CameraUtils", () => {

	it("converts horizontal and vertical FoV values in both directions", () => {

		for(const aspect of [0.5, 1, 16 / 9, 2]) {

			const horizontalFoV = 90;
			const verticalFoV = calculateVerticalFoV(horizontalFoV, aspect);
			const result = calculateHorizontalFoV(verticalFoV, aspect);

			assert.ok(Math.abs(result - horizontalFoV) < 1e-10);

		}

	});

	it("uses a 16:9 aspect ratio by default", () => {

		assert.ok(Math.abs(calculateVerticalFoV(90) - 58.71550708558255) < 1e-12);
		assert.ok(Math.abs(calculateHorizontalFoV(90) - 121.28449291441746) < 1e-12);

	});

});
