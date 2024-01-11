import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.downsampling.frag";
import vertexShader from "./shaders/convolution.downsampling.vert";

/**
 * A downsampling material.
 *
 * Based on an article by Fabrice Piquet.
 *
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 * @category Materials
 */

export class DownsamplingMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new downsampling material.
	 */

	constructor() {

		super({
			name: "DownsamplingMaterial",
			fragmentShader,
			vertexShader
		});

	}

}
