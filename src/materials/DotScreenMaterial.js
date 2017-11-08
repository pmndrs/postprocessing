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
	 * @param {Boolean} [options] - The options.
	 * @param {Boolean} [options.average=false] - Whether the shader should output the colour average (black and white).
	 * @param {Boolean} [options.angle=1.57] - The angle of the dot pattern.
	 * @param {Boolean} [options.scale=1.0] - The scale of the dot pattern.
	 * @param {Boolean} [options.intensity=1.0] - The intensity of the effect.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			average: false,
			angle: 1.57,
			scale: 1.0,
			intensity: 1.0
		}, options);

		super({

			type: "DotScreenMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),

				angle: new Uniform(settings.angle),
				scale: new Uniform(settings.scale),
				intensity: new Uniform(settings.intensity),

				offsetRepeat: new Uniform(new Vector4(0.5, 0.5, 1.0, 1.0))

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		this.setAverageEnabled(settings.average);

	}

	/**
	 * Enables or disables the Screen blend mode.
	 *
	 * @param {Boolean} enabled - Whether the Screen blend mode should be enabled.
	 */

	setAverageEnabled(enabled) {

		if(enabled) {

			this.defines.AVERAGE = "1";

		} else {

			delete this.defines.AVERAGE;

		}

		this.needsUpdate = true;

	}

}
