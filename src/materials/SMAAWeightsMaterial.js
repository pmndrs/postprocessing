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
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The search lookup texture.
	 *
	 * @type {Texture}
	 */

	get searchTexture() {

		return this.uniforms.searchTexture.value;

	}

	set searchTexture(value) {

		this.uniforms.searchTexture.value = value;

	}

	/**
	 * The area lookup texture.
	 *
	 * @type {Texture}
	 */

	get areaTexture() {

		return this.uniforms.areaTexture.value;

	}

	set areaTexture(value) {

		this.uniforms.areaTexture.value = value;

	}

	/**
	 * Sets the search and area lookup textures.
	 *
	 * @deprecated Use searchTexture and areaTexture instead.
	 * @param {Texture} search - The search lookup texture.
	 * @param {Texture} area - The area lookup texture.
	 */

	setLookupTextures(search, area) {

		this.searchTexture = search;
		this.areaTexture = area;

	}

	/**
	 * The maximum amount of steps performed in the horizontal/vertical pattern searches, at each side of the pixel.
	 * Range: [0, 112].
	 *
	 * In number of pixels, it's actually the double. So the maximum line length perfectly handled by, for example 16, is
	 * 64 (perfectly means that longer lines won't look as good, but are still antialiased).
	 *
	 * @type {Number}
	 */

	get orthogonalSearchSteps() {

		return Number(this.defines.MAX_SEARCH_STEPS_INT);

	}

	set orthogonalSearchSteps(value) {

		const s = Math.min(Math.max(value, 0), 112);
		this.defines.MAX_SEARCH_STEPS_INT = s.toFixed("0");
		this.defines.MAX_SEARCH_STEPS_FLOAT = s.toFixed("1");
		this.needsUpdate = true;

	}

	/**
	 * Sets the maximum amount of steps performed in the horizontal/vertical pattern searches, at each side of the pixel.
	 *
	 * @deprecated Use orthogonalSearchSteps instead.
	 * @param {Number} value - The search steps. Range: [0, 112].
	 */

	setOrthogonalSearchSteps(value) {

		this.orthogonalSearchSteps = value;

	}

	/**
	 * The maximum steps performed in the diagonal pattern searches, at each side of the pixel. This search
	 * jumps one pixel at a time. Range: [0, 20].
	 *
	 * On high-end machines this search is cheap (between 0.8x and 0.9x slower for 16 steps), but it can have a
	 * significant impact on older machines.
	 *
	 * @type {Number}
	 */

	get diagonalSearchSteps() {

		return Number(this.defines.MAX_SEARCH_STEPS_DIAG_INT);

	}

	set diagonalSearchSteps(value) {

		const s = Math.min(Math.max(value, 0), 20);
		this.defines.MAX_SEARCH_STEPS_DIAG_INT = s.toFixed("0");
		this.defines.MAX_SEARCH_STEPS_DIAG_FLOAT = s.toFixed("1");
		this.needsUpdate = true;

	}

	/**
	 * Specifies the maximum steps performed in the diagonal pattern searches, at each side of the pixel.
	 *
	 * @deprecated Use diagonalSearchSteps instead.
	 * @param {Number} value - The search steps. Range: [0, 20].
	 */

	setDiagonalSearchSteps(value) {

		this.diagonalSearchSteps = value;

	}

	/**
	 * Indicates whether diagonal pattern detection is enabled.
	 *
	 * @type {Boolean}
	 */

	get diagonalDetection() {

		return (this.defines.DISABLE_DIAG_DETECTION === undefined);

	}

	set diagonalDetection(value) {

		if(value) {

			delete this.defines.DISABLE_DIAG_DETECTION;

		} else {

			this.defines.DISABLE_DIAG_DETECTION = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether diagonal pattern detection is enabled.
	 *
	 * @deprecated Use diagonalDetection instead.
	 * @return {Boolean} Whether diagonal pattern detection is enabled.
	 */

	isDiagonalDetectionEnabled() {

		return this.diagonalDetection;

	}

	/**
	 * Enables or disables diagonal pattern detection.
	 *
	 * @deprecated Use diagonalDetection instead.
	 * @param {Boolean} value - Whether diagonal pattern detection should be enabled.
	 */

	setDiagonalDetectionEnabled(value) {

		this.diagonalDetection = value;

	}

	/**
	 * Specifies how much sharp corners will be rounded. Range: [0, 100].
	 *
	 * @type {Number}
	 */

	get cornerRounding() {

		return Number(this.defines.CORNER_ROUNDING);

	}

	set cornerRounding(value) {

		const r = Math.min(Math.max(value, 0), 100);
		this.defines.CORNER_ROUNDING = r.toFixed("4");
		this.defines.CORNER_ROUNDING_NORM = (r / 100.0).toFixed("4");
		this.needsUpdate = true;

	}

	/**
	 * Specifies how much sharp corners will be rounded.
	 *
	 * @deprecated Use cornerRounding instead.
	 * @param {Number} value - The corner rounding amount. Range: [0, 100].
	 */

	setCornerRounding(value) {

		this.cornerRounding = value;

	}

	/**
	 * Indicates whether corner detection is enabled.
	 *
	 * @type {Number}
	 */

	get cornerDetection() {

		return (this.defines.DISABLE_CORNER_DETECTION === undefined);

	}

	set cornerDetection(value) {

		if(value) {

			delete this.defines.DISABLE_CORNER_DETECTION;

		} else {

			this.defines.DISABLE_CORNER_DETECTION = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether corner rounding is enabled.
	 *
	 * @deprecated Use cornerDetection instead.
	 * @return {Boolean} Whether corner rounding is enabled.
	 */

	isCornerRoundingEnabled() {

		return this.cornerDetection;

	}

	/**
	 * Enables or disables corner rounding.
	 *
	 * @deprecated Use cornerDetection instead.
	 * @param {Boolean} value - Whether corner rounding should be enabled.
	 */

	setCornerRoundingEnabled(value) {

		this.cornerDetection = value;

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
