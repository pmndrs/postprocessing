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
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The screen space position of the light source.
	 *
	 * @type {Vector2}
	 */

	get lightPosition() {

		return this.uniforms.lightPosition.value;

	}

	/**
	 * Returns the screen space position of the light source.
	 *
	 * @deprecated Use lightPosition instead.
	 * @return {Vector2} The position.
	 */

	getLightPosition() {

		return this.uniforms.lightPosition.value;

	}

	/**
	 * Sets the screen space position of the light source.
	 *
	 * @deprecated Use lightPosition instead.
	 * @param {Vector2} value - The position.
	 */

	setLightPosition(value) {

		this.uniforms.lightPosition.value = value;

	}

	/**
	 * The density.
	 *
	 * @type {Number}
	 */

	get density() {

		return this.uniforms.density.value;

	}

	set density(value) {

		this.uniforms.density.value = value;

	}

	/**
	 * Returns the density.
	 *
	 * @deprecated Use density instead.
	 * @return {Number} The density.
	 */

	getDensity() {

		return this.uniforms.density.value;

	}

	/**
	 * Sets the density.
	 *
	 * @deprecated Use density instead.
	 * @param {Number} value - The density.
	 */

	setDensity(value) {

		this.uniforms.density.value = value;

	}

	/**
	 * The decay.
	 *
	 * @type {Number}
	 */

	get decay() {

		return this.uniforms.decay.value;

	}

	set decay(value) {

		this.uniforms.decay.value = value;

	}

	/**
	 * Returns the decay.
	 *
	 * @deprecated Use decay instead.
	 * @return {Number} The decay.
	 */

	getDecay() {

		return this.uniforms.decay.value;

	}

	/**
	 * Sets the decay.
	 *
	 * @deprecated Use decay instead.
	 * @param {Number} value - The decay.
	 */

	setDecay(value) {

		this.uniforms.decay.value = value;

	}

	/**
	 * The weight.
	 *
	 * @type {Number}
	 */

	get weight() {

		return this.uniforms.weight.value;

	}

	set weight(value) {

		this.uniforms.weight.value = value;

	}

	/**
	 * Returns the weight.
	 *
	 * @deprecated Use weight instead.
	 * @return {Number} The weight.
	 */

	getWeight() {

		return this.uniforms.weight.value;

	}

	/**
	 * Sets the weight.
	 *
	 * @deprecated Use weight instead.
	 * @param {Number} value - The weight.
	 */

	setWeight(value) {

		this.uniforms.weight.value = value;

	}

	/**
	 * The exposure.
	 *
	 * @type {Number}
	 */

	get exposure() {

		return this.uniforms.exposure.value;

	}

	set exposure(value) {

		this.uniforms.exposure.value = value;

	}

	/**
	 * Returns the exposure.
	 *
	 * @deprecated Use exposure instead.
	 * @return {Number} The exposure.
	 */

	getExposure() {

		return this.uniforms.exposure.value;

	}

	/**
	 * Sets the exposure.
	 *
	 * @deprecated Use exposure instead.
	 * @param {Number} value - The exposure.
	 */

	setExposure(value) {

		this.uniforms.exposure.value = value;

	}

	/**
	 * The maximum light intensity.
	 *
	 * @type {Number}
	 */

	get maxIntensity() {

		return this.uniforms.clampMax.value;

	}

	set maxIntensity(value) {

		this.uniforms.clampMax.value = value;

	}

	/**
	 * Returns the maximum light intensity.
	 *
	 * @deprecated Use maxIntensity instead.
	 * @return {Number} The maximum light intensity.
	 */

	getMaxIntensity() {

		return this.uniforms.clampMax.value;

	}

	/**
	 * Sets the maximum light intensity.
	 *
	 * @deprecated Use maxIntensity instead.
	 * @param {Number} value - The maximum light intensity.
	 */

	setMaxIntensity(value) {

		this.uniforms.clampMax.value = value;

	}

	/**
	 * The amount of samples per pixel.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number(this.defines.SAMPLES_INT);

	}

	set samples(value) {

		const s = Math.floor(value);
		this.defines.SAMPLES_INT = s.toFixed(0);
		this.defines.SAMPLES_FLOAT = s.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Returns the amount of samples per pixel.
	 *
	 * @deprecated Use samples instead.
	 * @return {Number} The sample count.
	 */

	getSamples() {

		return this.samples;

	}

	/**
	 * Sets the amount of samples per pixel.
	 *
	 * @deprecated Use samples instead.
	 * @param {Number} value - The sample count.
	 */

	setSamples(value) {

		this.samples = value;

	}

}
