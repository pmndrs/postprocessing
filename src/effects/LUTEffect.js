import { FloatType, LinearEncoding, sRGBEncoding, Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/lut/shader.frag";

/**
 * A LUT effect.
 *
 * References:
 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
 * https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-24-using-lookup-tables-accelerate-color
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

		/**
		 * The output encoding.
		 *
		 * @type {Number}
		 * @private
		 */

		this.outputEncoding = this.inputEncoding;

		this.setInputEncoding(sRGBEncoding);
		this.setLUT(lut);

	}

	/**
	 * Returns the current output encoding.
	 *
	 * @return {Number} The encoding.
	 */

	getOutputEncoding() {

		return this.outputEncoding;

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
		const lut = this.getLUT();

		switch(value) {

			case sRGBEncoding:
				defines.set("linearToInputTexel(texel)", "LinearTosRGB(texel)");
				break;

			case LinearEncoding:
				defines.set("linearToInputTexel(texel)", "texel");
				break;

			default:
				console.error("Unsupported input encoding:", value);
				break;

		}

		if(lut !== null) {

			// The encoding of the input colors persists if the the LUT is linear.
			this.outputEncoding = (lut.encoding === LinearEncoding) ? value : lut.encoding;

			switch(this.outputEncoding) {

				case sRGBEncoding:
					defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");
					break;

				case LinearEncoding:
					defines.set("texelToLinear(texel)", "texel");
					break;

				default:
					console.error("Unsupported LUT encoding:", lut.encoding);
					break;

			}

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
	 * @param {Texture} lut - The LUT.
	 */

	setLUT(lut) {

		const defines = this.defines;
		const inputEncoding = this.inputEncoding;

		if(this.getLUT() !== lut) {

			defines.clear();

			const image = lut.image;
			const size = Math.min(image.width, image.height);

			const scale = (size - 1.0) / size;
			const offset = 1.0 / (2.0 * size);

			defines.set("COORD_SCALE", scale.toFixed(16));
			defines.set("COORD_OFFSET", offset.toFixed(16));

			if(lut.isDataTexture3D) {

				defines.set("LUT_3D", "1");

			} else {

				if(image.width > image.height) {

					defines.set("LUT_STRIP_HORIZONTAL", "1");

				}

				defines.set("LUT_SIZE", size.toFixed(16));
				defines.set("LUT_TEXEL_WIDTH", (1.0 / image.width).toFixed(16));
				defines.set("LUT_TEXEL_HEIGHT", (1.0 / image.height).toFixed(16));

			}

			if(lut.type === FloatType) {

				defines.set("LUT_PRECISION_HIGH", "1");

			}

			this.uniforms.get("lut").value = lut;
			this.setInputEncoding(inputEncoding);
			this.setChanged();

		}

	}

}
