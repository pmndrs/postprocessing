import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/adaptive-luminosity/shader.frag";
import vertex from "./glsl/adaptive-luminosity/shader.vert";

/**
 * An adaptive luminosity shader material.
 */

export class AdaptiveLuminosityMaterial extends ShaderMaterial {

	/**
	 * Constructs a new adaptive luminosity material.
	 */

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
