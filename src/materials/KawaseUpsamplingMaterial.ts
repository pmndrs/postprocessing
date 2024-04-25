import { Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.upsample-kawase.frag";
import vertexShader from "./shaders/convolution.upsample-kawase.vert";

/**
 * Gaussian blur material options.
 *
 * @category Materials
 */

export interface KawaseUpsamplingMaterialOptions {

	/**
	 * The kernel size. Must be an odd number.
	 *
	 * @defaultValue 35
	 */

	scale?: number;

}

/**
 * A kawase upsampling material.
 *
 * Based on alex47's ShaderToy implementation of the Dual Kawase Blur Algorithm.
 *
 * @see https://www.shadertoy.com/view/3td3W8
 * @category Materials
 */

export class KawaseUpsamplingMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new upsampling material.
	 */

	constructor({ scale = 0.35 }: KawaseUpsamplingMaterialOptions = {}) {

		super({
			name: "KawaseUpsamplingMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				scale: new Uniform(scale)
			}
		});

		this.scale = scale;

	}

	/**
	 * The kernel size.
	 */

	get scale(): number {

		return this.uniforms.scale.value as number;

	}

	set scale(value: number) {

		this.uniforms.scale.value = value;

	}

}
