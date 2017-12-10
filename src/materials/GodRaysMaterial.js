import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/god-rays/shader.frag";
import vertex from "./glsl/god-rays/shader.vert";

/**
 * A crepuscular rays shader material.
 *
 * This material supports dithering.
 *
 * References:
 *
 * Thibaut Despoulain, 2012:
 *  [(WebGL) Volumetric Light Approximation in Three.js](
 *  http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html)
 *
 * Nvidia, GPU Gems 3, 2008:
 *  [Chapter 13. Volumetric Light Scattering as a Post-Process](
 *  https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch13.html)
 */

export class GodRaysMaterial extends ShaderMaterial {

	/**
	 * Constructs a new god rays material.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.density=0.96] - The density of the light rays.
	 * @param {Number} [options.decay=0.93] - An illumination decay factor.
	 * @param {Number} [options.weight=0.4] - A light ray weight factor.
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

			type: "GodRaysMaterial",

			defines: {

				NUM_SAMPLES_FLOAT: "60.0",
				NUM_SAMPLES_INT: "60"

			},

			uniforms: {

				tDiffuse: new Uniform(null),
				lightPosition: new Uniform(null),

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
