import { Texture, Uniform, Vector2 } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.upsampling.frag";
import vertexShader from "./shaders/convolution.upsampling.vert";

/**
 * UpsamplingMaterial constructor options.
 *
 * @category Passes
 */

export interface UpsamplingMaterialOptions {

	/**
	 * The blur radius.
	 *
	 * @defaultValue 0.85
	 */

	radius?: number;

}

/**
 * An upsampling material.
 *
 * Based on an article by Fabrice Piquet.
 *
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 * @category Materials
 */

export class UpsamplingMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new upsampling material.
	 */

	constructor({ radius = 0.85 }: UpsamplingMaterialOptions = {}) {

		super({
			name: "UpsamplingMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				USE_SUPPORT_BUFFER: true
			},
			uniforms: {
				supportBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				radius: new Uniform(0.0)
			}
		});

		this.radius = radius;

	}

	/**
	 * A support buffer.
	 *
	 * Assumed to use the same texture type as the main input buffer.
	 */

	set supportBuffer(value: Texture | null) {

		this.uniforms.supportBuffer.value = value;

	}

	/**
	 * The blur radius.
	 *
	 * @defaultValue 0.85
	 */

	get radius(): number {

		return this.uniforms.radius.value as number;

	}

	set radius(value: number) {

		this.uniforms.radius.value = value;

		const b0 = this.defines.USE_SUPPORT_BUFFER !== undefined;
		const b1 = value < 1.0;

		if(b0 === b1) {

			return;

		}

		if(b1) {

			this.defines.USE_SUPPORT_BUFFER = true;

		} else {

			delete this.defines.USE_SUPPORT_BUFFER;

		}

		this.needsUpdate = true;

	}

}
