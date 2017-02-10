import { ShaderMaterial, Vector4 } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A dot screen shader material.
 *
 * @class DotScreenMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Boolean} [average=false] - Whether the shader should output the colour average (black and white).
 */

export class DotScreenMaterial extends ShaderMaterial {

	constructor(average = false) {

		super({

			type: "DotScreenMaterial",

			uniforms: {

				tDiffuse: { value: null },

				angle: { value: 1.57 },
				scale: { value: 1.0 },
				intensity: { value: 1.0 },

				offsetRepeat: { value: new Vector4(0.5, 0.5, 1.0, 1.0) }

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		if(average) { this.defines.AVERAGE = "1"; }

	}

}
