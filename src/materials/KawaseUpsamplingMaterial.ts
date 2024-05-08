import { Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.upsample-kawase.frag";
import vertexShader from "./shaders/convolution.upsample-kawase.vert";

/**
 * Kawase upsampling material options.
 *
 * @category Materials
 */

export interface KawaseUpsamplingMaterialOptions {

	/**
	 * The scale of the blur kernel.
	 *
	 * @defaultValue 0.35
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
	 * Constructs a new kawase upsampling material.
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
	 * The scale of the blur kernel.
	 */

	get scale(): number {

		return this.uniforms.scale.value as number;

	}

	set scale(value: number) {

		this.uniforms.scale.value = value;

	}

}
