import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/depth-mask/shader.frag";
import vertex from "./glsl/common/shader.vert";

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

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
