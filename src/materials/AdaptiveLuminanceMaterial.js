import { NoBlending, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/adaptive-luminance.frag";
import vertexShader from "./glsl/common.vert";

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
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

	}

	/**
	 * The primary luminance buffer that contains the downsampled average luminance.
	 *
	 * @type {Texture}
	 */

	set luminanceBuffer0(value) {

		this.uniforms.luminanceBuffer0.value = value;

	}

	/**
	 * Sets the primary luminance buffer that contains the downsampled average luminance.
	 *
	 * @deprecated Use luminanceBuffer0 instead.
	 * @param {Texture} value - The buffer.
	 */

	setLuminanceBuffer0(value) {

		this.uniforms.luminanceBuffer0.value = value;

	}

	/**
	 * The secondary luminance buffer.
	 *
	 * @type {Texture}
	 */

	set luminanceBuffer1(value) {

		this.uniforms.luminanceBuffer1.value = value;

	}

	/**
	 * Sets the secondary luminance buffer.
	 *
	 * @deprecated Use luminanceBuffer1 instead.
	 * @param {Texture} value - The buffer.
	 */

	setLuminanceBuffer1(value) {

		this.uniforms.luminanceBuffer1.value = value;

	}

	/**
	 * The 1x1 mipmap level.
	 *
	 * This level is used to identify the smallest mipmap of the primary luminance buffer.
	 *
	 * @type {Number}
	 */

	set mipLevel1x1(value) {

		this.defines.MIP_LEVEL_1X1 = value.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Sets the 1x1 mipmap level.
	 *
	 * @deprecated Use mipLevel1x1 instead.
	 * @param {Number} value - The level.
	 */

	setMipLevel1x1(value) {

		this.mipLevel1x1 = value;

	}

	/**
	 * The delta time.
	 *
	 * @type {Number}
	 */

	set deltaTime(value) {

		this.uniforms.deltaTime.value = value;

	}

	/**
	 * Sets the delta time.
	 *
	 * @deprecated Use deltaTime instead.
	 * @param {Number} value - The delta time.
	 */

	setDeltaTime(value) {

		this.uniforms.deltaTime.value = value;

	}

	/**
	 * The lowest possible luminance value.
	 *
	 * @type {Number}
	 */

	get minLuminance() {

		return this.uniforms.minLuminance.value;

	}

	set minLuminance(value) {

		this.uniforms.minLuminance.value = value;

	}

	/**
	 * Returns the lowest possible luminance value.
	 *
	 * @deprecated Use minLuminance instead.
	 * @return {Number} The minimum luminance.
	 */

	getMinLuminance() {

		return this.uniforms.minLuminance.value;

	}

	/**
	 * Sets the minimum luminance.
	 *
	 * @deprecated Use minLuminance instead.
	 * @param {Number} value - The minimum luminance.
	 */

	setMinLuminance(value) {

		this.uniforms.minLuminance.value = value;

	}

	/**
	 * The luminance adaptation rate.
	 *
	 * @type {Number}
	 */

	get adaptationRate() {

		return this.uniforms.tau.value;

	}

	set adaptationRate(value) {

		this.uniforms.tau.value = value;

	}

	/**
	 * Returns the luminance adaptation rate.
	 *
	 * @deprecated Use adaptationRate instead.
	 * @return {Number} The adaptation rate.
	 */

	getAdaptationRate() {

		return this.uniforms.tau.value;

	}

	/**
	 * Sets the luminance adaptation rate.
	 *
	 * @deprecated Use adaptationRate instead.
	 * @param {Number} value - The adaptation rate.
	 */

	setAdaptationRate(value) {

		this.uniforms.tau.value = value;

	}

}
