import { ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/depth-mask/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A depth mask shader material.
 *
 * This material masks a color buffer by comparing two depth textures.
 */

export class DepthMaskMaterial extends ShaderMaterial {

	/**
	 * Constructs a new depth mask material.
	 */

	constructor() {

		super({

			type: "DepthMaskMaterial",

			uniforms: {

				depthBuffer0: new Uniform(null),
				depthBuffer1: new Uniform(null),
				inputBuffer: new Uniform(null)

			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

	}

}
