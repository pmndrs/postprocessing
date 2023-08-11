import { NoBlending, ShaderMaterial, Texture, Uniform } from "three";

import fragmentShader from "./shaders/adaptive-luminance.frag";
import vertexShader from "./shaders/common.vert";

/**
 * An adaptive luminance shader material.
 *
 * @group Materials
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
	 */

	set luminanceBuffer0(value: Texture) {

		this.uniforms.luminanceBuffer0.value = value;

	}

	/**
	 * The secondary luminance buffer.
	 */

	set luminanceBuffer1(value: Texture) {

		this.uniforms.luminanceBuffer1.value = value;

	}

	/**
	 * The 1x1 mipmap level.
	 *
	 * This level is used to identify the smallest mipmap of the primary luminance buffer.
	 */

	set mipLevel1x1(value: number) {

		this.defines.MIP_LEVEL_1X1 = value.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * The delta time.
	 */

	set deltaTime(value: number) {

		this.uniforms.deltaTime.value = value;

	}

	/**
	 * The lowest possible luminance value.
	 */

	get minLuminance(): number {

		return this.uniforms.minLuminance.value as number;

	}

	set minLuminance(value: number) {

		this.uniforms.minLuminance.value = value;

	}

	/**
	 * The luminance adaptation rate.
	 */

	get adaptationRate(): number {

		return this.uniforms.tau.value as number;

	}

	set adaptationRate(value: number) {

		this.uniforms.tau.value = value;

	}

}
