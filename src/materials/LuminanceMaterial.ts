import { NoBlending, ShaderMaterial, Texture, Uniform } from "three";

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
 * @group Materials
 */

export class LuminanceMaterial extends ShaderMaterial {

	/**
	 * Constructs a new luminance material.
	 */

	constructor() {

		super({
			name: "LuminanceMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				threshold: new Uniform(0.0),
				smoothing: new Uniform(0.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

	}

	/**
	 * The input buffer.
	 */

	set inputBuffer(value: Texture | null) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The luminance threshold.
	 */

	get threshold(): number {

		return this.uniforms.threshold.value as number;

	}

	set threshold(value: number) {

		if(this.smoothing > 0 || value > 0) {

			this.defines.THRESHOLD = "1";

		} else {

			delete this.defines.THRESHOLD;

		}

		this.uniforms.threshold.value = value;

	}

	/**
	 * The luminance smoothing.
	 */

	get smoothing(): number {

		return this.uniforms.smoothing.value as number;

	}

	set smoothing(value: number) {

		if(this.threshold > 0 || value > 0) {

			this.defines.THRESHOLD = "1";

		} else {

			delete this.defines.THRESHOLD;

		}

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

			this.defines.COLOR = "1";

		} else {

			delete this.defines.COLOR;

		}

		this.needsUpdate = true;

	}

}
