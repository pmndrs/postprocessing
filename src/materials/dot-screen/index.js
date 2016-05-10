import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A dot screen shader material.
 *
 * @class DotScreenMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Boolean} [average] - Whether the shader should output the colour average (black and white).
 */

export class DotScreenMaterial extends THREE.ShaderMaterial {

	constructor(average) {

		super({

			type: "DotScreenMaterial",

			uniforms: {

				tDiffuse: {value: null},

				angle: {value: 1.57},
				scale: {value: 1.0},
				intensity: {value: 1.0},

				offsetRepeat: {value: new THREE.Vector4(0.5, 0.5, 1.0, 1.0)}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

	if(average) { this.defines.AVERAGE = "1"; }

}
