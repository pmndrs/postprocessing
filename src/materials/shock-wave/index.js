import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A shock wave shader material.
 *
 * Based on a Gist by Jean-Philippe Sarda:
 *  https://gist.github.com/jpsarda/33cea67a9f2ecb0a0eda
 *
 * @class ShockWaveMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Object} [options] - The options.
 * @param {Number} [options.waveSize=0.2] - The wave size.
 * @param {Number} [options.amplitude=0.05] - The distortion amplitude.
 */

export class ShockWaveMaterial extends ShaderMaterial {

	constructor(options = {}) {

		if(options.maxRadius === undefined) { options.maxRadius = 1.0; }
		if(options.waveSize === undefined) { options.waveSize = 0.2; }
		if(options.amplitude === undefined) { options.amplitude = 0.05; }

		super({

			type: "ShockWaveMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),

				center: new Uniform(new Vector2(0.5, 0.5)),
				aspect: new Uniform(1.0),
				cameraDistance: new Uniform(1.0),

				size: new Uniform(1.0),
				radius: new Uniform(-options.waveSize),
				maxRadius: new Uniform(options.maxRadius),
				waveSize: new Uniform(options.waveSize),
				amplitude: new Uniform(options.amplitude)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
