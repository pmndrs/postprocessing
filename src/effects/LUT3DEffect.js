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

import { LookupTexture } from "../textures";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/lut-3d.frag";

/**
 * A LUT effect.
 *
 * The tetrahedral interpolation algorithm was inspired by an implementation from OpenColorIO which is licensed under
 * the BSD 3-Clause License.
 *
 * The manual trilinear interpolation algorithm is based on an implementation by Garret Johnson which is licensed under
 * the MIT License.
 *
 * References:
 * https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-24-using-lookup-tables-accelerate-color
 * https://www.nvidia.com/content/GTC/posters/2010/V01-Real-Time-Color-Space-Conversion-for-High-Resolution-Video.pdf
 * https://github.com/AcademySoftwareFoundation/OpenColorIO/blob/master/src/OpenColorIO/ops/lut3d/
 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
 *
 * TODO Replace DataTexture3D with Data3DTexture.
 */

export class LUT3DEffect extends Effect {

	/**
	 * Constructs a new color grading effect.
	 *
	 * @param {Texture} lut - The lookup texture.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Boolean} [options.tetrahedralInterpolation=false] - Enables or disables tetrahedral interpolation.
	 * @param {Encoding} [options.inputEncoding=sRGBEncoding] - LUT input encoding.
	 */

	constructor(lut, {
		blendFunction,
		tetrahedralInterpolation = false,
		inputEncoding = sRGBEncoding
	} = {}) {

		super("LUT3DEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["lut", new Uniform(null)],
				["scale", new Uniform(new Vector3())],
				["offset", new Uniform(new Vector3())],
				["domainMin", new Uniform(null)],
				["domainMax", new Uniform(null)]
			])
		});

		this.tetrahedralInterpolation = tetrahedralInterpolation;
		this.inputEncoding = inputEncoding;
		this.lut = lut;

	}

	/**
	 * Returns the output encoding.
	 *
	 * @deprecated
	 * @return {TextureEncoding} The encoding.
	 */

	getOutputEncoding() {

		return Number(this.defines.get("OUTPUT_ENCODING"));

	}

	/**
	 * The input encoding. Default is `sRGBEncoding`.
	 *
	 * Set this to `LinearEncoding` if your LUT expects linear color input.
	 *
	 * @type {TextureEncoding}
	 */

	get inputEncoding() {

		return Number(this.defines.get("INPUT_ENCODING"));

	}

	set inputEncoding(value) {

		const lut = this.lut;
		const defines = this.defines;
		defines.set("INPUT_ENCODING", value.toFixed(0));

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

			// The encoding of the input colors carries over if the LUT is linear.
			const outputEncoding = (lut.encoding === LinearEncoding) ? value : lut.encoding;
			defines.set("OUTPUT_ENCODING", outputEncoding.toFixed(0));

			switch(outputEncoding) {

				case sRGBEncoding:
					defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");
					break;

				case LinearEncoding:
					defines.set("texelToLinear(texel)", "texel");
					break;

				default:
					console.error("Unsupported output encoding:", outputEncoding);
					break;

			}

		}

		this.setChanged();

	}

	/**
	 * Returns the input encoding.
	 *
	 * @deprecated Use inputEncoding instead.
	 * @return {TextureEncoding} The encoding.
	 */

	getInputEncoding() {

		return this.inputEncoding;

	}

	/**
	 * Sets the input encoding.
	 *
	 * @deprecated Use inputEncoding instead.
	 * @param {TextureEncoding} value - The encoding.
	 */

	setInputEncoding(value) {

		this.inputEncoding = value;

	}

	/**
	 * The LUT.
	 *
	 * @type {Texture}
	 */

	get lut() {

		return this.uniforms.get("lut").value;

	}

	set lut(value) {

		const defines = this.defines;
		const uniforms = this.uniforms;

		if(this.lut !== value) {

			uniforms.get("lut").value = value;

			if(value !== null) {

				const image = value.image;

				// Remember settings that are backed by defines.
				const tetrahedralInterpolation = this.tetrahedralInterpolation;
				const inputEncoding = this.inputEncoding;

				defines.clear();
				defines.set("LUT_SIZE", Math.min(image.width, image.height).toFixed(16));
				defines.set("LUT_TEXEL_WIDTH", (1.0 / image.width).toFixed(16));
				defines.set("LUT_TEXEL_HEIGHT", (1.0 / image.height).toFixed(16));

				uniforms.get("domainMin").value = null;
				uniforms.get("domainMax").value = null;

				if(value.type === FloatType || value.type === HalfFloatType) {

					defines.set("LUT_PRECISION_HIGH", "1");

				}

				if(image.width > image.height) {

					defines.set("LUT_STRIP_HORIZONTAL", "1");

				} else if(value instanceof DataTexture3D) {

					defines.set("LUT_3D", "1");

				}

				if(value instanceof LookupTexture) {

					const min = value.domainMin;
					const max = value.domainMax;

					if(min.x !== 0 || min.y !== 0 || min.z !== 0 || max.x !== 1 || max.y !== 1 || max.z !== 1) {

						defines.set("CUSTOM_INPUT_DOMAIN", "1");
						uniforms.get("domainMin").value = min.clone();
						uniforms.get("domainMax").value = max.clone();

					}

				}

				// Refresh settings that depend on and affect the LUT.
				this.tetrahedralInterpolation = tetrahedralInterpolation;
				this.inputEncoding = inputEncoding;

			}

		}

	}

	/**
	 * Returns the current LUT.
	 *
	 * @deprecated Use lut instead.
	 * @return {Texture} The LUT.
	 */

	getLUT() {

		return this.lut;

	}

	/**
	 * Sets the LUT.
	 *
	 * @deprecated Use lut instead.
	 * @param {Texture} value - The LUT.
	 */

	setLUT(value) {

		this.lut = value;

	}

	/**
	 * Updates the scale and offset for the LUT sampling coordinates.
	 *
	 * @private
	 */

	updateScaleOffset() {

		const lut = this.lut;

		if(lut !== null) {

			const size = Math.min(lut.image.width, lut.image.height);
			const scale = this.uniforms.get("scale").value;
			const offset = this.uniforms.get("offset").value;

			if(this.tetrahedralInterpolation && lut instanceof DataTexture3D) {

				if(this.defines.has("CUSTOM_INPUT_DOMAIN")) {

					const domainScale = lut.domainMax.clone().sub(lut.domainMin);
					scale.setScalar(size - 1).divide(domainScale);
					offset.copy(lut.domainMin).negate().multiply(scale);

				} else {

					scale.setScalar(size - 1);
					offset.setScalar(0);

				}

			} else {

				if(this.defines.has("CUSTOM_INPUT_DOMAIN")) {

					const domainScale = lut.domainMax.clone().sub(lut.domainMin).multiplyScalar(size);
					scale.setScalar(size - 1).divide(domainScale);
					offset.copy(lut.domainMin).negate().multiply(scale).addScalar(1.0 / (2.0 * size));

				} else {

					scale.setScalar((size - 1) / size);
					offset.setScalar(1.0 / (2.0 * size));

				}

			}

		}

	}

	/**
	 * Configures parameters for tetrahedral interpolation.
	 *
	 * @private
	 */

	configureTetrahedralInterpolation() {

		const lut = this.lut;

		if(lut !== null) {

			lut.minFilter = LinearFilter;
			lut.magFilter = LinearFilter;

			if(this.tetrahedralInterpolation) {

				if(lut instanceof DataTexture3D) {

					// Interpolate samples manually.
					lut.minFilter = NearestFilter;
					lut.magFilter = NearestFilter;

				} else {

					console.warn("Tetrahedral interpolation requires a 3D texture");

				}

			}

			// TODO Added for compatibility with r138. Remove later.
			if(lut.source === undefined) {

				lut.needsUpdate = true;

			}

		}

	}

	/**
	 * Indicates whether tetrahedral interpolation is enabled. Requires a 3D LUT, disabled by default.
	 *
	 * Tetrahedral interpolation produces highly accurate results but is slower than hardware interpolation.
	 *
	 * @type {Boolean}
	 */

	get tetrahedralInterpolation() {

		return this.defines.has("TETRAHEDRAL_INTERPOLATION");

	}

	set tetrahedralInterpolation(value) {

		if(value) {

			this.defines.set("TETRAHEDRAL_INTERPOLATION", "1");

		} else {

			this.defines.delete("TETRAHEDRAL_INTERPOLATION");

		}

		this.configureTetrahedralInterpolation();
		this.updateScaleOffset();
		this.setChanged();

	}

	/**
	 * Enables or disables tetrahedral interpolation.
	 *
	 * @deprecated Use tetrahedralInterpolation instead.
	 * @param {Boolean} value - Whether tetrahedral interpolation should be enabled.
	 */

	setTetrahedralInterpolationEnabled(value) {

		this.tetrahedralInterpolation = value;

	}

}
