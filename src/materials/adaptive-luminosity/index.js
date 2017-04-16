import { ShaderMaterial, Uniform } from "three";

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

export class AdaptiveLuminosityMaterial extends ShaderMaterial {

	constructor() {

		super({

			type: "AdaptiveLuminosityMaterial",

			defines: {

				MIP_LEVEL_1X1: "0.0"

			},

			uniforms: {

				tPreviousLum: new Uniform(null),
				tCurrentLum: new Uniform(null),
				minLuminance: new Uniform(0.01),
				delta: new Uniform(0.0),
				tau: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
