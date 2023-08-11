import { NoBlending, ShaderMaterial, Texture, Uniform, Vector2 } from "three";
import { Resizable } from "../core/Resizable.js";

import fragmentShader from "./shaders/convolution.downsampling.frag";
import vertexShader from "./shaders/convolution.downsampling.vert";

/**
 * A downsampling material.
 *
 * Based on an article by Fabrice Piquet.
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 * @group Materials
 */

export class DownsamplingMaterial extends ShaderMaterial implements Resizable {

	/**
	 * Constructs a new downsampling material.
	 */

	constructor() {

		super({
			name: "DownsamplingMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2())
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
	 * The input buffer.
	 */

	set inputBuffer(value: Texture | null) {

		this.uniforms.inputBuffer.value = value;

	}

	setSize(width: number, height: number): void {

		const texelSize = this.uniforms.texelSize.value as Vector2;
		texelSize.set(1.0 / width, 1.0 / height);

	}

}
