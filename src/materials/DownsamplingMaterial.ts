import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.downsampling.frag";
import vertexShader from "./shaders/convolution.downsampling.vert";

/**
 * DownsamplingMaterial constructor options.
 *
 * @category Materials
 */

export interface DownsamplingMaterialOptions {

	/**
	 * Controls whether the sampling coordinates should be clamped to a black border.
	 *
	 * @defaultValue true
	 */

	clampToBorder?: boolean;

}

/**
 * A downsampling material.
 *
 * Based on an article by Fabrice Piquet.
 *
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 * @category Materials
 */

export class DownsamplingMaterial extends FullscreenMaterial implements DownsamplingMaterialOptions {

	/**
	 * Constructs a new downsampling material.
	 */

	constructor({ clampToBorder = true }: DownsamplingMaterialOptions = {}) {

		super({
			name: "DownsamplingMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				CLAMP_TO_BORDER: true
			}
		});

		this.clampToBorder = clampToBorder;

	}

	get clampToBorder(): boolean {

		return this.defines.CLAMP_TO_BORDER !== undefined;

	}

	set clampToBorder(value: boolean) {

		if(this.clampToBorder === value) {

			return;

		}

		if(value) {

			this.defines.CLAMP_TO_BORDER = true;

		} else {

			delete this.defines.CLAMP_TO_BORDER;

		}

		this.needsUpdate = true;

	}

}
