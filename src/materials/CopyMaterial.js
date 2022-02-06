import { NoBlending, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/copy/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A simple copy shader material.
 */

export class CopyMaterial extends ShaderMaterial {

	/**
	 * Constructs a new copy material.
	 */

	constructor() {

		super({
			name: "CopyMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				opacity: new Uniform(1.0)
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
	 * Sets the input buffer.
	 *
	 * @param {Number} value - The buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Returns the opacity.
	 *
	 * @return {Number} The opacity.
	 */

	getOpacity(value) {

		return this.uniforms.opacity.value;

	}

	/**
	 * Sets the opacity.
	 *
	 * @param {Number} value - The opacity.
	 */

	setOpacity(value) {

		this.uniforms.opacity.value = value;

	}

}
