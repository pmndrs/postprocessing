import { NoBlending, ShaderMaterial, Uniform } from "three";
import { updateFragmentShader } from "../utils";

import fragmentShader from "./glsl/copy.frag";
import vertexShader from "./glsl/common.vert";

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
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.fragmentShader = updateFragmentShader(this.fragmentShader);

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
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Number} value - The buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Returns the opacity.
	 *
	 * @deprecated Use opacity instead.
	 * @return {Number} The opacity.
	 */

	getOpacity(value) {

		return this.uniforms.opacity.value;

	}

	/**
	 * Sets the opacity.
	 *
	 * @deprecated Use opacity instead.
	 * @param {Number} value - The opacity.
	 */

	setOpacity(value) {

		this.uniforms.opacity.value = value;

	}

}
