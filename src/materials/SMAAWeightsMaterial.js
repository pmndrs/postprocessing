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
	 * @param {Vector2} [resolution] - The resolution.
	 */

	constructor(texelSize = new Vector2(), resolution = new Vector2()) {

		super({

			type: "SMAAWeightsMaterial",

			defines: {

				// Configurable settings:
				MAX_SEARCH_STEPS_INT: "16",
				MAX_SEARCH_STEPS_FLOAT: "16.0",
				MAX_SEARCH_STEPS_DIAG_INT: "8",
				MAX_SEARCH_STEPS_DIAG_FLOAT: "8.0",
				CORNER_ROUNDING: "25",
				CORNER_ROUNDING_NORM: "0.25",

				// Non-configurable settings:
				AREATEX_MAX_DISTANCE: "16.0",
				AREATEX_MAX_DISTANCE_DIAG: "20.0",
				AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
				AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)",
				SEARCHTEX_SIZE: "vec2(66.0, 33.0)",
				SEARCHTEX_PACKED_SIZE: "vec2(64.0, 16.0)"

			},

			uniforms: {

				inputBuffer: new Uniform(null),
				areaTexture: new Uniform(null),
				searchTexture: new Uniform(null),
				texelSize: new Uniform(texelSize),
				resolution: new Uniform(resolution)

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

		steps = Math.min(Math.max(steps, 0), 112);

		this.defines.MAX_SEARCH_STEPS_INT = steps.toFixed("0");
		this.defines.MAX_SEARCH_STEPS_FLOAT = steps.toFixed("1");
		this.needsUpdate = true;

	}

	/**
	 * Specifies the maximum steps performed in the diagonal pattern searches, at
	 * each side of the pixel. This search jumps one pixel at time.
	 *
	 * On high-end machines this search is cheap (between 0.8x and 0.9x slower for
	 * 16 steps), but it can have a significant impact on older machines.
	 *
	 * @param {Number} steps - The search steps. Range: [0, 20].
	 */

	setDiagonalSearchSteps(steps) {

		steps = Math.min(Math.max(steps, 0), 20);

		this.defines.MAX_SEARCH_STEPS_DIAG_INT = steps.toFixed("0");
		this.defines.MAX_SEARCH_STEPS_DIAG_FLOAT = steps.toFixed("1");
		this.needsUpdate = true;

	}

	/**
	 * Specifies how much sharp corners will be rounded.
	 *
	 * @param {Number} rounding - The corner rounding amount. Range: [0, 100].
	 */

	setCornerRounding(rounding) {

		rounding = Math.min(Math.max(rounding, 0), 100);

		this.defines.CORNER_ROUNDING = rounding.toFixed("4");
		this.defines.CORNER_ROUNDING_NORM = (rounding / 100.0).toFixed("4");
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether diagonal pattern detection is enabled.
	 *
	 * @type {Boolean}
	 */

	get diagonalDetection() {

		return (this.defines.DISABLE_DIAG_DETECTION === undefined);

	}

	/**
	 * Enables or disables diagonal pattern detection.
	 *
	 * @type {Boolean}
	 */

	set diagonalDetection(value) {

		value ? (delete this.defines.DISABLE_DIAG_DETECTION) :
			(this.defines.DISABLE_DIAG_DETECTION = "1");

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether corner rounding is enabled.
	 *
	 * @type {Boolean}
	 */

	get cornerRounding() {

		return (this.defines.DISABLE_CORNER_DETECTION === undefined);

	}

	/**
	 * Enables or disables corner rounding.
	 *
	 * @type {Boolean}
	 */

	set cornerRounding(value) {

		value ? (delete this.defines.DISABLE_CORNER_DETECTION) :
			(this.defines.DISABLE_CORNER_DETECTION = "1");

		this.needsUpdate = true;

	}

}
