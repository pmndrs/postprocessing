import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/convolution.upsampling.frag";
import vertexShader from "./glsl/convolution.upsampling.vert";

/**
 * An upsampling material.
 *
 * Based on an article by Fabrice Piquet:
 * https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 *
 * @implements {Resizable}
 */

export class UpsamplingMaterial extends ShaderMaterial {

	/**
	 * Constructs a new upsampling material.
	 */

	constructor() {

		super({
			name: "UpsamplingMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				supportBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				radius: new Uniform(0.85)
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
	 * A support buffer.
	 *
	 * @type {Texture}
	 */

	set supportBuffer(value) {

		this.uniforms.supportBuffer.value = value;

	}

	/**
	 * The blur radius.
	 *
	 * @type {Number}
	 */

	get radius() {

		return this.uniforms.radius.value;

	}

	set radius(value) {

		this.uniforms.radius.value = value;

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}
