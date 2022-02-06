import { NoBlending, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/god-rays/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

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
 *
 * @todo Remove dithering code from fragment shader.
 */

export class GodRaysMaterial extends ShaderMaterial {

	/**
	 * Constructs a new god rays material.
	 *
	 * TODO Remove lightPosition param.
	 * @param {Vector2} lightPosition - Deprecated.
	 */

	constructor(lightPosition) {

		super({
			name: "GodRaysMaterial",
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
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Returns the screen space position of the light source.
	 *
	 * @return {Vector2} The position.
	 */

	getLightPosition() {

		return this.uniforms.lightPosition.value;

	}

	/**
	 * Sets the screen space position of the light source.
	 *
	 * @param {Vector2} value - The position.
	 */

	setLightPosition(value) {

		this.uniforms.lightPosition.value = value;

	}

	/**
	 * Returns the density.
	 *
	 * @return {Number} The density.
	 */

	getDensity() {

		return this.uniforms.density.value;

	}

	/**
	 * Sets the density.
	 *
	 * @param {Number} value - The density.
	 */

	setDensity(value) {

		this.uniforms.density.value = value;

	}

	/**
	 * Returns the decay.
	 *
	 * @return {Number} The decay.
	 */

	getDecay() {

		return this.uniforms.decay.value;

	}

	/**
	 * Sets the decay.
	 *
	 * @param {Number} value - The decay.
	 */

	setDecay(value) {

		this.uniforms.decay.value = value;

	}

	/**
	 * Returns the weight.
	 *
	 * @return {Number} The weight.
	 */

	getWeight() {

		return this.uniforms.weight.value;

	}

	/**
	 * Sets the weight.
	 *
	 * @param {Number} value - The weight.
	 */

	setWeight(value) {

		this.uniforms.weight.value = value;

	}

	/**
	 * Returns the exposure.
	 *
	 * @return {Number} The exposure.
	 */

	getExposure() {

		return this.uniforms.exposure.value;

	}

	/**
	 * Sets the exposure.
	 *
	 * @param {Number} value - The exposure.
	 */

	setExposure(value) {

		this.uniforms.exposure.value = value;

	}

	/**
	 * Returns the maximum light intensity.
	 *
	 * @return {Number} The maximum light intensity.
	 */

	getMaxIntensity() {

		return this.uniforms.clampMax.value;

	}

	/**
	 * Sets the maximum light intensity.
	 *
	 * @param {Number} value - The maximum light intensity.
	 */

	setMaxIntensity(value) {

		this.uniforms.clampMax.value = value;

	}

	/**
	 * The amount of samples per pixel.
	 *
	 * @type {Number}
	 * @deprecated Use getSamples() instead.
	 */

	get samples() {

		return this.getSamples();

	}

	/**
	 * Sets the amount of samples per pixel.
	 *
	 * @type {Number}
	 * @deprecated Use setSamples() instead.
	 */

	set samples(value) {

		this.setSamples(value);

	}

	/**
	 * Returns the amount of samples per pixel.
	 *
	 * @return {Number} The sample count.
	 */

	getSamples() {

		return Number(this.defines.SAMPLES_INT);

	}

	/**
	 * Sets the amount of samples per pixel.
	 *
	 * @param {Number} value - The sample count.
	 */

	setSamples(value) {

		const s = Math.floor(value);
		this.defines.SAMPLES_INT = s.toFixed(0);
		this.defines.SAMPLES_FLOAT = s.toFixed(1);
		this.needsUpdate = true;

	}

}
