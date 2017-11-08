import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/shock-wave/shader.frag";
import vertex from "./glsl/shock-wave/shader.vert";

/**
 * A shock wave shader material.
 *
 * Based on a Gist by Jean-Philippe Sarda:
 *  https://gist.github.com/jpsarda/33cea67a9f2ecb0a0eda
 */

export class ShockWaveMaterial extends ShaderMaterial {

	/**
	 * Constructs a new shock wave material.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.waveSize=0.2] - The wave size.
	 * @param {Number} [options.amplitude=0.05] - The distortion amplitude.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			maxRadius: 1.0,
			waveSize: 0.2,
			amplitude: 0.05
		}, options);

		super({

			type: "ShockWaveMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),

				center: new Uniform(new Vector2(0.5, 0.5)),
				aspect: new Uniform(1.0),
				cameraDistance: new Uniform(1.0),

				size: new Uniform(1.0),
				radius: new Uniform(-settings.waveSize),
				maxRadius: new Uniform(settings.maxRadius),
				waveSize: new Uniform(settings.waveSize),
				amplitude: new Uniform(settings.amplitude)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
