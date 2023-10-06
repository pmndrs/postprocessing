import { Texture, Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/copy.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A copy shader material.
 *
 * @group Materials
 */

export class CopyMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new copy material.
	 */

	constructor() {

		super({
			name: "CopyMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				inputBuffer: new Uniform(null)
			}
		});

	}

	/**
	 * The input buffer.
	 */

	get inputBuffer(): Texture | null {

		return this.uniforms.inputBuffer.value as Texture;

	}

	set inputBuffer(value: Texture | null) {

		this.uniforms.inputBuffer.value = value;

	}

}
