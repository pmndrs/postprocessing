import { Texture, Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/depth-downsampling.frag";
import vertexShader from "./shaders/depth-downsampling.vert";

/**
 * A depth downsampling shader material.
 *
 * Based on an article by Eleni Maria Stea.
 * @see https://eleni.mutantstargoat.com/hikiko/depth-aware-upsampling-6
 * @group Materials
 */

export class DepthDownsamplingMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new depth downsampling material.
	 */

	constructor() {

		super({
			name: "DepthDownsamplingMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				depthBuffer: new Uniform(null),
				normalBuffer: new Uniform(null)
			}
		});

	}

	/**
	 * The depth buffer.
	 */

	set depthBuffer(value: Texture | null) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The normal buffer.
	 */

	set normalBuffer(value: Texture | null) {

		this.uniforms.normalBuffer.value = value;

		if(value !== null) {

			this.defines.DOWNSAMPLE_NORMALS = "1";

		} else {

			delete this.defines.DOWNSAMPLE_NORMALS;

		}

		this.needsUpdate = true;

	}

}
