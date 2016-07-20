import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A glitch shader material.
 *
 * Reference:
 *  https://github.com/staffantan/unityglitch
 *
 * @class GlitchMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

export class GlitchMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			type: "GlitchMaterial",

			uniforms: {

				tDiffuse: { value: null },
				tPerturb: { value: null },

				active: { value: 1 },

				amount: { value: 0.8 },
				angle: { value: 0.02 },
				seed: { value: 0.02 },
				seedX: { value: 0.02 },
				seedY: { value: 0.02 },
				distortionX: { value: 0.5 },
				distortionY: { value: 0.6 },
				colS: { value: 0.05 }

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
