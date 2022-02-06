import { NoBlending, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/adaptive-luminance/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * An adaptive luminance shader material.
 */

export class AdaptiveLuminanceMaterial extends ShaderMaterial {

	/**
	 * Constructs a new adaptive luminance material.
	 */

	constructor() {

		super({
			name: "AdaptiveLuminanceMaterial",
			defines: {
				MIP_LEVEL_1X1: "0.0"
			},
			uniforms: {
				luminanceBuffer0: new Uniform(null),
				luminanceBuffer1: new Uniform(null),
				minLuminance: new Uniform(0.01),
				deltaTime: new Uniform(0.0),
				tau: new Uniform(1.0)
			},
			extensions: {
				shaderTextureLOD: true
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
	 * Sets the primary luminance buffer which contains the downsampled average luminance.
	 *
	 * @param {Texture} value - The buffer.
	 */

	setLuminanceBuffer0(value) {

		this.uniforms.luminanceBuffer0.value = value;

	}

	/**
	 * Sets the secondary luminance buffer.
	 *
	 * @param {Texture} value - The buffer.
	 */

	setLuminanceBuffer1(value) {

		this.uniforms.luminanceBuffer1.value = value;

	}

	/**
	 * Sets the 1x1 mipmap level.
	 *
	 * This level is used to identify the smallest mipmap of the primary luminance buffer.
	 *
	 * @param {Number} value - The level.
	 */

	setMipLevel1x1(value) {

		this.defines.MIP_LEVEL_1X1 = value.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Sets the delta time.
	 *
	 * @param {Number} value - The delta time.
	 */

	setDeltaTime(value) {

		this.uniforms.deltaTime.value = value;

	}

	/**
	 * Returns the lowest possible luminance value.
	 *
	 * @return {Number} The minimum luminance.
	 */

	getMinLuminance() {

		return this.uniforms.minLuminance.value;

	}

	/**
	 * Sets the minimum luminance.
	 *
	 * @param {Number} value - The minimum luminance.
	 */

	setMinLuminance(value) {

		this.uniforms.minLuminance.value = value;

	}

	/**
	 * Returns the luminance adaptation rate.
	 *
	 * @return {Number} The adaptation rate.
	 */

	getAdaptationRate() {

		return this.uniforms.tau.value;

	}

	/**
	 * Sets the luminance adaptation rate.
	 *
	 * @param {Number} value - The adaptation rate.
	 */

	setAdaptationRate(value) {

		this.uniforms.tau.value = value;

	}

}
