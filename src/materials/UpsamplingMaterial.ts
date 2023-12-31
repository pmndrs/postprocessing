import { Texture, Uniform, Vector2 } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.upsampling.frag";
import vertexShader from "./shaders/convolution.upsampling.vert";

/**
 * An upsampling material.
 *
 * Based on an article by Fabrice Piquet.
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 * @group Materials
 */

export class UpsamplingMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new upsampling material.
	 */

	constructor() {

		super({
			name: "UpsamplingMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				supportBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				radius: new Uniform(0.85)
			}
		});

	}

	/**
	 * A support buffer.
	 *
	 * Assumed to use the same texture type as the main input buffer.
	 */

	set supportBuffer(value: Texture | null) {

		this.uniforms.supportBuffer.value = value;

	}

	/**
	 * The blur radius.
	 */

	get radius(): number {

		return this.uniforms.radius.value as number;

	}

	set radius(value: number) {

		this.uniforms.radius.value = value;

	}

}
