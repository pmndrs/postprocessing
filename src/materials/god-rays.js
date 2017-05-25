import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/god-rays/shader.frag";
import vertex from "./glsl/god-rays/shader.vert";

/**
 * A crepuscular rays shader material.
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
	 */

	constructor() {

		super({

			type: "GodRaysMaterial",

			defines: {

				NUM_SAMPLES_FLOAT: "60.0",
				NUM_SAMPLES_INT: "60"

			},

			uniforms: {

				tDiffuse: new Uniform(null),
				lightPosition: new Uniform(null),

				exposure: new Uniform(0.6),
				decay: new Uniform(0.93),
				density: new Uniform(0.96),
				weight: new Uniform(0.4),
				clampMax: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
