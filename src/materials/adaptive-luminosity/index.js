import shader from "./inlined/shader";
import THREE from "three";

/**
 * An adaptive luminosity shader material.
 *
 * @class AdaptiveLuminosityMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export class AdaptiveLuminosityMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			defines: {

				MIP_LEVEL_1X1: "0.0"

			},

			uniforms: {

				tPreviousLum: {type: "t", value: null},
				tCurrentLum: {type: "t", value: null},
				delta: {type: "f", value: 0.0},
				tau: {type: "f", value: 1.0}

			},

			fragmentShader: shader.fragment,
			vertexShader: shader.vertex

		});

	}

}
