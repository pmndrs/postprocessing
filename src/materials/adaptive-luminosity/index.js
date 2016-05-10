import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * An adaptive luminosity shader material.
 *
 * @class AdaptiveLuminosityMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

export class AdaptiveLuminosityMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			type: "AdaptiveLuminosityMaterial",

			defines: {

				MIP_LEVEL_1X1: "0.0"

			},

			uniforms: {

				tPreviousLum: {value: null},
				tCurrentLum: {value: null},
				delta: {value: 0.0},
				tau: {value: 1.0}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
