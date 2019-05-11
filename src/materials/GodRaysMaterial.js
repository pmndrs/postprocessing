import { ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/god-rays/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

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
	 * @param {Vector2} lightPosition - The light position in screen space.
	 */

	constructor(lightPosition) {

		super({

			type: "GodRaysMaterial",

			defines: {

				SAMPLES_INT: "60",
				SAMPLES_FLOAT: "60.0"

			},

			uniforms: {

				inputBuffer: new Uniform(null),
				lightPosition: new Uniform(lightPosition),

				density: new Uniform(1.0),
				decay: new Uniform(1.0),
				weight: new Uniform(1.0),
				exposure: new Uniform(1.0),
				clampMax: new Uniform(1.0)

			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

	}

	/**
	 * The amount of samples per pixel.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number.parseInt(this.defines.SAMPLES_INT);

	}

	/**
	 * Sets the amount of samples per pixel.
	 *
	 * @type {Number}
	 */

	set samples(value) {

		value = Math.floor(value);

		this.defines.SAMPLES_INT = value.toFixed(0);
		this.defines.SAMPLES_FLOAT = value.toFixed(1);
		this.needsUpdate = true;

	}

}
