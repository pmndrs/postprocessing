import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/radial-blur/shader.frag";
import vertex from "./glsl/radial-blur/shader.vert";

/**
 * A radial blur shader material.
 *
 * This material supports dithering.
 */

export class RadialBlurMaterial extends ShaderMaterial {

	/**
	 * Constructs a new radial blur material.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.density=0.96] - A blur density factor.
	 * @param {Number} [options.decay=0.93] - A blur decay factor.
	 * @param {Number} [options.weight=0.4] - A ray weight factor.
	 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
	 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			exposure: 0.6,
			density: 0.93,
			decay: 0.96,
			weight: 0.4,
			clampMax: 1.0
		}, options);

		super({

			type: "RadialBlurMaterial",

			defines: {

				NUM_SAMPLES_FLOAT: "60.0",
				NUM_SAMPLES_INT: "60"

			},

			uniforms: {

				inputBuffer: new Uniform(null),
				center: new Uniform(null),

				exposure: new Uniform(settings.exposure),
				decay: new Uniform(settings.decay),
				density: new Uniform(settings.density),
				weight: new Uniform(settings.weight),
				clampMax: new Uniform(settings.clampMax)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
