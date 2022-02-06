import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/smaa-weights/shader.frag";
import vertexShader from "./glsl/smaa-weights/shader.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material computes weights for detected edges.
 *
 * @implements {Resizable}
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
			name: "SMAAWeightsMaterial",
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
				searchTexture: new Uniform(null),
				areaTexture: new Uniform(null),
				resolution: new Uniform(resolution),
				texelSize: new Uniform(texelSize)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the search and area lookup textures.
	 *
	 * @param {Texture} search - The search lookup texture.
	 * @param {Texture} area - The area lookup texture.
	 */

	setLookupTextures(search, area) {

		this.uniforms.searchTexture.value = search;
		this.uniforms.areaTexture.value = area;

	}

	/**
	 * Sets the maximum amount of steps performed in the horizontal/vertical pattern searches, at each side of the pixel.
	 *
	 * In number of pixels, it's actually the double. So the maximum line length perfectly handled by, for example 16, is
	 * 64 (perfectly means that longer lines won't look as good, but are still antialiased).
	 *
	 * @param {Number} value - The search steps. Range: [0, 112].
	 */

	setOrthogonalSearchSteps(value) {

		const s = Math.min(Math.max(value, 0), 112);

		this.defines.MAX_SEARCH_STEPS_INT = s.toFixed("0");
		this.defines.MAX_SEARCH_STEPS_FLOAT = s.toFixed("1");
		this.needsUpdate = true;

	}

	/**
	 * Specifies the maximum steps performed in the diagonal pattern searches, at each side of the pixel. This search
	 * jumps one pixel at a time.
	 *
	 * On high-end machines this search is cheap (between 0.8x and 0.9x slower for 16 steps), but it can have a
	 * significant impact on older machines.
	 *
	 * @param {Number} value - The search steps. Range: [0, 20].
	 */

	setDiagonalSearchSteps(value) {

		const s = Math.min(Math.max(value, 0), 20);

		this.defines.MAX_SEARCH_STEPS_DIAG_INT = s.toFixed("0");
		this.defines.MAX_SEARCH_STEPS_DIAG_FLOAT = s.toFixed("1");
		this.needsUpdate = true;

	}

	/**
	 * Specifies how much sharp corners will be rounded.
	 *
	 * @param {Number} value - The corner rounding amount. Range: [0, 100].
	 */

	setCornerRounding(value) {

		const r = Math.min(Math.max(value, 0), 100);

		this.defines.CORNER_ROUNDING = r.toFixed("4");
		this.defines.CORNER_ROUNDING_NORM = (r / 100.0).toFixed("4");
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether diagonal pattern detection is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use isDiagonalDetectionEnabled() instead.
	 */

	get diagonalDetection() {

		return this.isDiagonalDetectionEnabled();

	}

	/**
	 * Enables or disables diagonal pattern detection.
	 *
	 * @type {Boolean}
	 * @deprecated Use setDiagonalDetectionEnabled() instead.
	 */

	set diagonalDetection(value) {

		this.setDiagonalDetectionEnabled(value);

	}

	/**
	 * Indicates whether diagonal pattern detection is enabled.
	 *
	 * @return {Boolean} Whether diagonal pattern detection is enabled.
	 */

	isDiagonalDetectionEnabled() {

		return (this.defines.DISABLE_DIAG_DETECTION === undefined);

	}

	/**
	 * Enables or disables diagonal pattern detection.
	 *
	 * @param {Boolean} value - Whether diagonal pattern detection should be enabled.
	 */

	setDiagonalDetectionEnabled(value) {

		if(value) {

			delete this.defines.DISABLE_DIAG_DETECTION;

		} else {

			this.defines.DISABLE_DIAG_DETECTION = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether corner rounding is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use isCornerRoundingEnabled() instead.
	 */

	get cornerRounding() {

		return this.isCornerRoundingEnabled();

	}

	/**
	 * Enables or disables corner rounding.
	 *
	 * @type {Boolean}
	 * @deprecated Use setCornerRoundingEnabled() instead.
	 */

	set cornerRounding(value) {

		this.setCornerRoundingEnabled(value);

	}

	/**
	 * Indicates whether corner rounding is enabled.
	 *
	 * @return {Boolean} Whether corner rounding is enabled.
	 */

	isCornerRoundingEnabled() {

		return (this.defines.DISABLE_CORNER_DETECTION === undefined);

	}

	/**
	 * Enables or disables corner rounding.
	 *
	 * @param {Boolean} value - Whether corner rounding should be enabled.
	 */

	setCornerRoundingEnabled(value) {

		if(value) {

			delete this.defines.DISABLE_CORNER_DETECTION;

		} else {

			this.defines.DISABLE_CORNER_DETECTION = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const uniforms = this.uniforms;
		uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
		uniforms.resolution.value.set(width, height);

	}

}
