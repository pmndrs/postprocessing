import { FloatType, LinearEncoding, sRGBEncoding, Uniform } from "three";
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
			defines.clear();

			if(value !== null) {

				defines.set("USE_LUT", "1");

				if(value.isDataTexture3D) {

					defines.set("LUT_3D", "1");

				} else {

					let size = value.image.width;

					if(size > value.image.height) {

						defines.set("LUT_STRIP_HORIZONTAL");
						size = value.image.height;

					}

					defines.set("LUT_SIZE", size.toFixed(11));
					defines.set("LUT_TEXEL_SIZE", (1.0 / size).toFixed(11));
					defines.set("LUT_HALF_TEXEL_SIZE", (0.5 / size).toFixed(11));

				}

				if(value.encoding === sRGBEncoding) {

					this.defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");

				} else if(value.encoding === LinearEncoding) {

					this.defines.set("texelToLinear(texel)", "texel");

				} else {

					console.log("Unsupported encoding: " + value.encoding);

				}

				if(value.type === FloatType) {

					defines.set("LUT_HIGH_PRECISION", "1");

				}

			}

			this.setChanged();

		}

	}

}