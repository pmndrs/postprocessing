import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/glitch/shader.frag";
import vertex from "./glsl/glitch/shader.vert";

/**
 * A glitch shader material.
 *
 * Reference:
 *  https://github.com/staffantan/unityglitch
 */

export class GlitchMaterial extends ShaderMaterial {

	/**
	 * Constructs a new glitch material.
	 */

	constructor() {

		super({

			type: "GlitchMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				tPerturb: new Uniform(null),

				active: new Uniform(1),

				amount: new Uniform(0.8),
				angle: new Uniform(0.02),
				seed: new Uniform(0.02),
				seedX: new Uniform(0.02),
				seedY: new Uniform(0.02),
				distortionX: new Uniform(0.5),
				distortionY: new Uniform(0.6),
				colS: new Uniform(0.05)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
