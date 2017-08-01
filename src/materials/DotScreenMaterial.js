import { ShaderMaterial, Uniform, Vector4 } from "three";

import fragment from "./glsl/dot-screen/shader.frag";
import vertex from "./glsl/dot-screen/shader.vert";

/**
 * A dot screen shader material.
 */

export class DotScreenMaterial extends ShaderMaterial {

	/**
	 * Constructs a new dot screen material.
	 *
	 * @param {Boolean} [average=false] - Whether the shader should output the colour average (black and white).
	 */

	constructor(average = false) {

		super({

			type: "DotScreenMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),

				angle: new Uniform(1.57),
				scale: new Uniform(1.0),
				intensity: new Uniform(1.0),

				offsetRepeat: new Uniform(new Vector4(0.5, 0.5, 1.0, 1.0))

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		if(average) { this.defines.AVERAGE = "1"; }

	}

}
