import { ShaderMaterial, Uniform } from "three";

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

			type: "CopyMaterial",

			uniforms: {

				inputBuffer: new Uniform(null),
				opacity: new Uniform(1.0)

			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

	}

}
