import { FloatType, Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/color-grading/shader.frag";

/**
 * A color grading effect.
 */

export class ColorGradingEffect extends Effect {

	/**
	 * Constructs a new color grading effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Texture} [options.lut] - A color lookup texture. Can be a 2D or 3D texture.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		lut = null
	} = {}) {

		super("ColorGradingEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["lut", new Uniform(null)]
			])

		});

		this.lut = lut;

	}

	/**
	 * The current LUT.
	 *
	 * @type {Texture}
	 */

	get lut() {

		return this.uniforms.get("lut").value;

	}

	/**
	 * Sets the LUT.
	 *
	 * @type {Texture}
	 */

	set lut(value) {

		const defines = this.defines;

		if(this.lut !== value) {

			this.uniforms.get("lut").value = value;

			defines.delete("USE_LUT");
			defines.delete("LUT_3D");
			defines.delete("LUT_HIGH_PRECISION");
			defines.delete("LUT_SIZE");
			defines.delete("INV_LUT_SIZE");
			defines.delete("LUT_HALF_TEXEL_SIZE");

			if(value !== null) {

				defines.set("USE_LUT", "1");
console.log(value);
				if(value.isDataTexture3D) {

					defines.set("LUT_3D", "1");

				} else {

					defines.set("LUT_SIZE", value.image.width.toFixed(6));
					defines.set("LUT_TEXEL_SIZE", (1.0 / value.image.width).toFixed(6));
					defines.set("LUT_HALF_TEXEL_SIZE", ((1.0 / value.image.width) * 0.5).toFixed(6));

				}

				if(value.type === FloatType) {

					defines.set("LUT_HIGH_PRECISION", "1");

				}

			}

			this.setChanged();

		}

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

	}

}
