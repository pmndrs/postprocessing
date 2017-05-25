import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/copy/shader.frag";
import vertex from "./glsl/copy/shader.vert";

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

				tDiffuse: new Uniform(null),
				opacity: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
