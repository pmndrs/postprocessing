import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A glitch shader material.
 * Based on https://github.com/staffantan/unityglitch
 *
 * @class GlitchMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export class GlitchMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			uniforms: {

				tDiffuse: {type: "t", value: null},
				tPerturb: {type: "t", value: null},

				active: {type: "i", value: 1},

				amount: {type: "f", value: 0.8},
				angle: {type: "f", value: 0.02},
				seed: {type: "f", value: 0.02},
				seedX: {type: "f", value: 0.02},
				seedY: {type: "f", value: 0.02},
				distortionX: {type: "f", value: 0.5},
				distortionY: {type: "f", value: 0.6},
				colS: {type: "f", value: 0.05}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
