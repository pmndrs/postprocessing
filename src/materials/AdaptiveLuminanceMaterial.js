import { NoBlending, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/adaptive-luminance/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * An adaptive luminance shader material.
 */

export class AdaptiveLuminanceMaterial extends ShaderMaterial {

	/**
	 * Constructs a new adaptive luminance material.
	 */

	constructor() {

		super({

			type: "AdaptiveLuminanceMaterial",

			defines: {
				MIP_LEVEL_1X1: "0.0"
			},

			uniforms: {
				luminanceBuffer0: new Uniform(null),
				luminanceBuffer1: new Uniform(null),
				minLuminance: new Uniform(0.01),
				deltaTime: new Uniform(0.0),
				tau: new Uniform(1.0)
			},

			fragmentShader,
			vertexShader,

			blending: NoBlending,
			depthWrite: false,
			depthTest: false,

			extensions: {
				shaderTextureLOD: true
			}

		});

		/** @ignore */
		this.toneMapped = false;

	}

}
