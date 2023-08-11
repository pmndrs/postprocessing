import { NoBlending, ShaderMaterial, Texture, Uniform, Vector4 } from "three";
import { Resizable } from "../core/Resizable.js";

import fragmentShader from "./shaders/smaa-weights.frag";
import vertexShader from "./shaders/smaa-weights.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material computes weights for detected edges.
 *
 * @group Materials
 */

export class SMAAWeightsMaterial extends ShaderMaterial implements Resizable {

	/**
	 * Constructs a new SMAA weights material.
	 */

	constructor() {

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
				resolution: new Uniform(new Vector4())
			},
			blending: NoBlending,
			toneMapped: false,
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

	set inputBuffer(value: Texture) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The search lookup texture.
	 */

	get searchTexture(): Texture | null {

		return this.uniforms.searchTexture.value as Texture;

	}

	set searchTexture(value: Texture | null) {

		this.uniforms.searchTexture.value = value;

	}

	/**
	 * The area lookup texture.
	 */

	get areaTexture(): Texture | null {

		return this.uniforms.areaTexture.value as Texture;

	}

	set areaTexture(value: Texture | null) {

		this.uniforms.areaTexture.value = value;

	}

	/**
	 * The maximum amount of steps performed in the horizontal/vertical pattern searches, at each side of the pixel.
	 * Range: [0, 112].
	 *
	 * In number of pixels, it's actually the double. So the maximum line length perfectly handled by, for example 16, is
	 * 64 (perfectly means that longer lines won't look as good, but are still antialiased).
	 */

	get orthogonalSearchSteps(): number {

		return Number(this.defines.MAX_SEARCH_STEPS_INT);

	}

	set orthogonalSearchSteps(value: number) {

		const s = Math.min(Math.max(value, 0), 112);
		this.defines.MAX_SEARCH_STEPS_INT = s.toFixed(0);
		this.defines.MAX_SEARCH_STEPS_FLOAT = s.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * The maximum steps performed in the diagonal pattern searches, at each side of the pixel. This search
	 * jumps one pixel at a time. Range: [0, 20].
	 *
	 * On high-end machines this search is cheap (between 0.8x and 0.9x slower for 16 steps), but it can have a
	 * significant impact on older machines.
	 */

	get diagonalSearchSteps(): number {

		return Number(this.defines.MAX_SEARCH_STEPS_DIAG_INT);

	}

	set diagonalSearchSteps(value: number) {

		const s = Math.min(Math.max(value, 0), 20);
		this.defines.MAX_SEARCH_STEPS_DIAG_INT = s.toFixed(0);
		this.defines.MAX_SEARCH_STEPS_DIAG_FLOAT = s.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether diagonal pattern detection is enabled.
	 */

	get diagonalDetection(): boolean {

		return (this.defines.DISABLE_DIAG_DETECTION === undefined);

	}

	set diagonalDetection(value: boolean) {

		if(value) {

			delete this.defines.DISABLE_DIAG_DETECTION;

		} else {

			this.defines.DISABLE_DIAG_DETECTION = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * Specifies how much sharp corners will be rounded. Range: [0, 100].
	 */

	get cornerRounding(): number {

		return Number(this.defines.CORNER_ROUNDING);

	}

	set cornerRounding(value: number) {

		const r = Math.min(Math.max(value, 0), 100);
		this.defines.CORNER_ROUNDING = r.toFixed(4);
		this.defines.CORNER_ROUNDING_NORM = (r / 100.0).toFixed(4);
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether corner detection is enabled.
	 */

	get cornerDetection(): boolean {

		return (this.defines.DISABLE_CORNER_DETECTION === undefined);

	}

	set cornerDetection(value: boolean) {

		if(value) {

			delete this.defines.DISABLE_CORNER_DETECTION;

		} else {

			this.defines.DISABLE_CORNER_DETECTION = "1";

		}

		this.needsUpdate = true;

	}

	setSize(width: number, height: number): void {

		const resolution = this.uniforms.resolution.value as Vector4;
		resolution.set(width, height, 1.0 / width, 1.0 / height);

	}

}
