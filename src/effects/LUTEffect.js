import {
	DataTexture3D,
	FloatType,
	HalfFloatType,
	LinearEncoding,
	LinearFilter,
	NearestFilter,
	sRGBEncoding,
	Uniform,
	Vector3
} from "three";

import { LookupTexture3D } from "../images/textures/LookupTexture3D";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/lut/shader.frag";

/**
 * A LUT effect.
 *
 * The tetrahedral interpolation algorithm was inspired by an implementation
 * from OpenColorIO which is licensed under the BSD 3-Clause License.
 *
 * The manual trilinear interpolation algorithm is based on an implementation
 * by Garret Johnson which is licensed under the MIT License.
 *
 * References:
 * https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-24-using-lookup-tables-accelerate-color
 * https://www.nvidia.com/content/GTC/posters/2010/V01-Real-Time-Color-Space-Conversion-for-High-Resolution-Video.pdf
 * https://github.com/AcademySoftwareFoundation/OpenColorIO/blob/master/src/OpenColorIO/ops/lut3d/
 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
 */

export class LUTEffect extends Effect {

	/**
	 * Constructs a new color grading effect.
	 *
	 * @param {Texture} lut - The lookup texture.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Boolean} [options.tetrahedralInterpolation=false] - Enables or disables tetrahedral interpolation.
	 */

	constructor(lut, {
		blendFunction = BlendFunction.NORMAL,
		tetrahedralInterpolation = false
	} = {}) {

		super("LUTEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["lut", new Uniform(null)],
				["scale", new Uniform(new Vector3())],
				["offset", new Uniform(new Vector3())],
				["domainMin", new Uniform(null)],
				["domainMax", new Uniform(null)]
			])

		});

		/**
		 * Indicates whether tetrahedral interpolation is enabled.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.tetrahedralInterpolation = tetrahedralInterpolation;

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
		const uniforms = this.uniforms;

		if(this.getLUT() !== lut) {

			const image = lut.image;

			defines.clear();

			defines.set("LUT_SIZE", Math.min(image.width, image.height).toFixed(16));
			defines.set("LUT_TEXEL_WIDTH", (1.0 / image.width).toFixed(16));
			defines.set("LUT_TEXEL_HEIGHT", (1.0 / image.height).toFixed(16));

			uniforms.get("lut").value = lut;
			uniforms.get("domainMin").value = null;
			uniforms.get("domainMax").value = null;

			if(lut.type === FloatType || lut.type === HalfFloatType) {

				defines.set("LUT_PRECISION_HIGH", "1");

			}

			if(image.width > image.height) {

				defines.set("LUT_STRIP_HORIZONTAL", "1");

			} else if(lut instanceof DataTexture3D) {

				defines.set("LUT_3D", "1");

			}

			if(lut instanceof LookupTexture3D) {

				const min = lut.domainMin;
				const max = lut.domainMax;

				if(min.x !== 0.0 || min.y !== 0.0 || min.z !== 0.0 ||
					max.x !== 1.0 || max.y !== 1.0 || max.z !== 1.0) {

					defines.set("CUSTOM_INPUT_DOMAIN", "1");
					uniforms.get("domainMin").value = min.clone();
					uniforms.get("domainMax").value = max.clone();

				}

			}

			this.configureTetrahedralInterpolation();
			this.updateScaleOffset();
			this.setInputEncoding(this.inputEncoding);
			this.setChanged();

		}

	}

	/**
	 * Updates the scale and offset for the LUT sampling coordinates.
	 *
	 * @private
	 */

	updateScaleOffset() {

		const lut = this.getLUT();
		const size = Math.min(lut.image.width, lut.image.height);
		const scale = this.uniforms.get("scale").value;
		const offset = this.uniforms.get("offset").value;

		if(this.defines.has("TETRAHEDRAL_INTERPOLATION")) {

			if(this.defines.has("CUSTOM_INPUT_DOMAIN")) {

				const domainScale = lut.domainMax.clone().sub(lut.domainMin);
				scale.setScalar(size - 1.0).divide(domainScale);
				offset.copy(lut.domainMin).negate().multiply(scale);

			} else {

				scale.setScalar(size - 1.0);
				offset.setScalar(0.0);

			}

		} else {

			if(this.defines.has("CUSTOM_INPUT_DOMAIN")) {

				const domainScale = lut.domainMax.clone().sub(lut.domainMin).multiplyScalar(size);
				scale.setScalar(size - 1.0).divide(domainScale);
				offset.copy(lut.domainMin).negate().multiply(scale).addScalar(1.0 / (2.0 * size));

			} else {

				scale.setScalar((size - 1.0) / size);
				offset.setScalar(1.0 / (2.0 * size));

			}

		}

	}

	/**
	 * Configures parameters for tetrahedral interpolation.
	 *
	 * @private
	 */

	configureTetrahedralInterpolation() {

		const lut = this.getLUT();
		lut.minFilter = LinearFilter;
		lut.magFilter = LinearFilter;

		this.defines.delete("TETRAHEDRAL_INTERPOLATION");

		if(this.tetrahedralInterpolation && lut !== null) {

			if(lut instanceof DataTexture3D) {

				this.defines.set("TETRAHEDRAL_INTERPOLATION", "1");

				// Interpolate samples manually.
				lut.minFilter = NearestFilter;
				lut.magFilter = NearestFilter;

			} else {

				console.warn("Tetrahedral interpolation requires a 3D texture");

			}

		}

		lut.needsUpdate = true;

	}

	/**
	 * Enables or disables tetrahedral interpolation. Requires a 3D LUT.
	 *
	 * Tetrahedral interpolation produces highly accurate results, but is slower
	 * than hardware interpolation. This feature is disabled by default.
	 *
	 * @param {Boolean} enabled - Whether tetrahedral interpolation should be enabled.
	 */

	setTetrahedralInterpolationEnabled(enabled) {

		this.tetrahedralInterpolation = enabled;
		this.configureTetrahedralInterpolation();
		this.updateScaleOffset();
		this.setChanged();

	}

}
