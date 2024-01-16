import { Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/luminance.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A luminance shader material.
 *
 * This shader produces a greyscale luminance map that describes the absolute amount of light emitted by a scene. It can
 * also be configured to output colors that are scaled with their respective luminance value.
 *
 * The alpha channel always contains the luminance value.
 *
 * @see https://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
 * @see https://hsto.org/getpro/habr/post_images/2ab/69d/084/2ab69d084f9a597e032624bcd74d57a7.png
 * @category Materials
 */

export class LuminanceMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new luminance material.
	 */

	constructor() {

		super({
			name: "LuminanceMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				threshold: new Uniform(0.0),
				smoothing: new Uniform(0.0)
			}
		});

	}

	/**
	 * Indicates whether the luminance threshold is enabled.
	 */

	private get thresholdEnabled(): boolean {

		return (this.defines.THRESHOLD !== undefined);

	}

	private set thresholdEnabled(value: boolean) {

		if(this.thresholdEnabled === value) {

			return;

		}

		if(value) {

			this.defines.THRESHOLD = true;

		} else {

			delete this.defines.THRESHOLD;

		}

		this.needsUpdate = true;

	}

	/**
	 * The luminance threshold.
	 */

	get threshold(): number {

		return this.uniforms.threshold.value as number;

	}

	set threshold(value: number) {

		this.thresholdEnabled = (this.smoothing > 0.0 || value > 0.0);
		this.uniforms.threshold.value = value;

	}

	/**
	 * The luminance smoothing.
	 */

	get smoothing(): number {

		return this.uniforms.smoothing.value as number;

	}

	set smoothing(value: number) {

		this.thresholdEnabled = (this.threshold > 0.0 || value > 0.0);
		this.uniforms.smoothing.value = value;

	}

	/**
	 * Indicates whether color output is enabled.
	 */

	get colorOutput(): boolean {

		return (this.defines.COLOR !== undefined);

	}

	set colorOutput(value: boolean) {

		if(value) {

			this.defines.COLOR = true;

		} else {

			delete this.defines.COLOR;

		}

		this.needsUpdate = true;

	}

}
