import { Texture, Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/smaa-weights.frag";
import vertexShader from "./shaders/smaa-weights.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material computes weights for detected edges.
 *
 * @group Materials
 */

export class SMAAWeightsMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new SMAA weights material.
	 */

	constructor() {

		super({
			name: "SMAAWeightsMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				// Configurable settings:
				MAX_SEARCH_STEPS: 16,
				MAX_SEARCH_STEPS_DIAG: 8,
				CORNER_ROUNDING: 25,
				CORNER_ROUNDING_NORM: 0.25,
				// Non-configurable settings:
				AREATEX_MAX_DISTANCE: 16,
				AREATEX_MAX_DISTANCE_DIAG: 20,
				AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
				AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)",
				SEARCHTEX_SIZE: "vec2(66.0, 33.0)",
				SEARCHTEX_PACKED_SIZE: "vec2(64.0, 16.0)"
			},
			uniforms: {
				searchTexture: new Uniform(null),
				areaTexture: new Uniform(null)
			}
		});

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

		return this.defines.MAX_SEARCH_STEPS as number;

	}

	set orthogonalSearchSteps(value: number) {

		const s = Math.min(Math.max(value, 0), 112);
		this.defines.MAX_SEARCH_STEPS = s;
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

		return this.defines.MAX_SEARCH_STEPS_DIAG as number;

	}

	set diagonalSearchSteps(value: number) {

		const s = Math.min(Math.max(value, 0), 20);
		this.defines.MAX_SEARCH_STEPS_DIAG = s;
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

			this.defines.DISABLE_DIAG_DETECTION = true;

		}

		this.needsUpdate = true;

	}

	/**
	 * Specifies how much sharp corners will be rounded. Range: [0, 100].
	 */

	get cornerRounding(): number {

		return this.defines.CORNER_ROUNDING as number;

	}

	set cornerRounding(value: number) {

		const r = Math.min(Math.max(value, 0), 100);
		this.defines.CORNER_ROUNDING = r;
		this.defines.CORNER_ROUNDING_NORM = r / 100.0;
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

			this.defines.DISABLE_CORNER_DETECTION = true;

		}

		this.needsUpdate = true;

	}

}
