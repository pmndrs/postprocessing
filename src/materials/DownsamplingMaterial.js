import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/convolution.downsampling.frag";
import vertexShader from "./glsl/common.vert";

/**
 * A downsampling material.
 *
 * Based on an article by Fabrice Piquet
 * https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 *
 * @implements {Resizable}
 */

export class DownsamplingMaterial extends ShaderMaterial {

	/**
	 * Constructs a new downsampling material.
	 */

	constructor() {

		super({
			name: "DownsamplingMaterial",
			defines: {
				SAMPLES: "13"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				kernel: new Uniform(new Float32Array([
					// (1 / 4) * 0.5 = 0.125
					-1.0, 1.0, 0.125, 1.0, 1.0, 0.125,
					-1.0, -1.0, 0.125, 1.0, -1.0, 0.125,
					// (1 / 9) * 0.5 = 0.0555555
					-2.0, 2.0, 0.0555555, 0.0, 2.0, 0.0555555, 2.0, 2.0, 0.0555555,
					-2.0, 0.0, 0.0555555, 0.0, 0.0, 0.0555555, 2.0, 0.0, 0.0555555,
					-2.0, -2.0, 0.0555555, 0.0, -2.0, 0.0555555, 2.0, -2.0, 0.0555555
				]))
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
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}
