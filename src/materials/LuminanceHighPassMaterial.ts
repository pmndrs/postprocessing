import { Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/luminance-high-pass.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A luminance high-pass shader material.
 *
 * @see https://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
 * @see https://hsto.org/getpro/habr/post_images/2ab/69d/084/2ab69d084f9a597e032624bcd74d57a7.png
 * @category Materials
 */

export class LuminanceHighPassMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new luminance high-pass material.
	 */

	constructor() {

		super({
			name: "LuminanceHighPassMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				threshold: new Uniform(0.0),
				smoothing: new Uniform(0.0)
			}
		});

	}

	/**
	 * The luminance threshold.
	 */

	get threshold(): number {

		return this.uniforms.threshold.value as number;

	}

	set threshold(value: number) {

		this.uniforms.threshold.value = value;

	}

	/**
	 * The luminance smoothing.
	 */

	get smoothing(): number {

		return this.uniforms.smoothing.value as number;

	}

	set smoothing(value: number) {

		this.uniforms.smoothing.value = value;

	}

}
