import { FloatType, LinearEncoding, sRGBEncoding, Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/lut/shader.frag";

/**
 * A LUT effect.
 */

export class LUTEffect extends Effect {

	/**
	 * Constructs a new color grading effect.
	 *
	 * @param {Texture} lut - The lookup texture.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 */

	constructor(lut, { blendFunction = BlendFunction.NORMAL } = {}) {

		super("LUTEffect", fragmentShader, {

			blendFunction,
			uniforms: new Map([
				["lut", new Uniform(null)]
			])

		});

		/**
		 * The input encoding.
		 *
		 * @type {Number}
		 * @private
		 */

		this.inputEncoding = sRGBEncoding;

		this.setInputEncoding(sRGBEncoding);
		this.setLUT(lut);

	}

	/**
	 * Returns the input encoding.
	 *
	 * This is set to `sRGBEncoding` by default since most LUTs expect sRGB input.
	 *
	 * @return {Number} The encoding.
	 */

	getInputEncoding() {

		return this.inputEncoding;

	}

	/**
	 * Sets the input encoding.
	 *
	 * Set this to `LinearEncoding` if your LUT expects linear color input.
	 *
	 * @param {Number} value - The encoding.
	 */

	setInputEncoding(value) {

		const defines = this.defines;

		switch(value) {

			case sRGBEncoding:
				defines.set("linearToInputTexel(texel)", "LinearTosRGB(texel)");
				break;

			case LinearEncoding:
				defines.set("linearToInputTexel(texel)", "texel");
				break;

			default:
				console.error("Unsupported encoding:", value);
				break;

		}

		if(this.inputEncoding !== value) {

			this.inputEncoding = value;
			this.setChanged();

		}

	}


	/**
	 * Returns the current LUT.
	 *
	 * @return {Texture} The LUT.
	 */

	getLUT() {

		return this.uniforms.get("lut").value;

	}

	/**
	 * Sets the LUT.
	 *
	 * @param {Texture} value - The LUT.
	 */

	setLUT(value) {

		const defines = this.defines;

		if(this.lut !== value) {

			this.uniforms.get("lut").value = value;

			// Clear all macros but keep the input encoding.
			defines.clear();
			this.setInputEncoding(this.inputEncoding);

			if(value.isDataTexture3D) {

				defines.set("LUT_3D", "1");

			} else {

				let size = value.image.width;

				if(size > value.image.height) {

					defines.set("LUT_STRIP_HORIZONTAL", "1");
					size = value.image.height;

				}

				defines.set("LUT_SIZE", size.toFixed(11));
				defines.set("LUT_TEXEL_SIZE", (1.0 / size).toFixed(11));
				defines.set("LUT_HALF_TEXEL_SIZE", (0.5 / size).toFixed(11));

			}

			switch(value.encoding) {

				case sRGBEncoding:
					defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");
					break;

				case LinearEncoding:
					defines.set("texelToLinear(texel)", "texel");
					break;

				default:
					console.error("Unsupported encoding:", value.encoding);
					break;

			}

			if(value.type === FloatType) {

				defines.set("LUT_PRECISION_HIGH", "1");

			}

			this.setChanged();

		}

	}

}
