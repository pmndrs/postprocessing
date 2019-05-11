import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/smaa-weights/shader.frag";
import vertexShader from "./glsl/smaa-weights/shader.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material computes weights for detected edges.
 */

export class SMAAWeightsMaterial extends ShaderMaterial {

	/**
	 * Constructs a new SMAA weights material.
	 *
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	constructor(texelSize = new Vector2()) {

		super({

			type: "SMAAWeightsMaterial",

			defines: {

				// Configurable settings:
				MAX_SEARCH_STEPS_INT: "8",
				MAX_SEARCH_STEPS_FLOAT: "8.0",

				// Non-configurable settings:
				AREATEX_MAX_DISTANCE: "16.0",
				AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
				AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)",
				SEARCHTEX_SIZE: "vec2(66.0, 33.0)",
				SEARCHTEX_PACKED_SIZE: "vec2(64.0, 16.0)"

			},

			uniforms: {

				inputBuffer: new Uniform(null),
				areaTexture: new Uniform(null),
				searchTexture: new Uniform(null),
				texelSize: new Uniform(texelSize)

			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

	}

	/**
	 * Sets the maximum amount of steps performed in the horizontal/vertical
	 * pattern searches, at each side of the pixel.
	 *
	 * In number of pixels, it's actually the double. So the maximum line length
	 * perfectly handled by, for example 16, is 64 (perfectly means that longer
	 * lines won't look as good, but are still antialiased).
	 *
	 * @param {Number} steps - The search steps. Range: [0, 112].
	 */

	setOrthogonalSearchSteps(steps) {

		this.defines.MAX_SEARCH_STEPS_INT = steps.toFixed("0");
		this.defines.MAX_SEARCH_STEPS_FLOAT = steps.toFixed("1");
		this.needsUpdate = true;

	}

}
