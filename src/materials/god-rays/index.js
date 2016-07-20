import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A crepuscular rays shader material.
 *
 * References:
 *
 * Thibaut Despoulain, 2012:
 *  (WebGL) Volumetric Light Approximation in Three.js
 *  http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html
 *
 * Nvidia, GPU Gems 3, 2008:
 *  Chapter 13. Volumetric Light Scattering as a Post-Process
 *  http://http.developer.nvidia.com/GPUGems3/gpugems3_ch13.html
 *
 * @class GodRaysMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

export class GodRaysMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			type: "GodRaysMaterial",

			defines: {

				NUM_SAMPLES_FLOAT: "60.0",
				NUM_SAMPLES_INT: "60"

			},

			uniforms: {

				tDiffuse: { value: null },
				lightPosition: { value: null },

				exposure: { value: 0.6 },
				decay: { value: 0.93 },
				density: { value: 0.96 },
				weight: { value: 0.4 },
				clampMax: { value: 1.0 }

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
