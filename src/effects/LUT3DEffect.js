import {
	Data3DTexture,
	FloatType,
	HalfFloatType,
	LinearFilter,
	NearestFilter,
	SRGBColorSpace,
	Uniform,
	Vector3
} from "three";

import { BlendFunction } from "../enums/BlendFunction.js";
import { LookupTexture } from "../textures/lut/LookupTexture.js";
import { Effect } from "./Effect.js";

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
 */

export class LUT3DEffect extends Effect {

	/**
	 * Constructs a new color grading effect.
	 *
	 * @param {Texture} lut - The lookup texture.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 * @param {Boolean} [options.tetrahedralInterpolation=false] - Enables or disables tetrahedral interpolation.
	 * @param {ColorSpace} [options.inputColorSpace=SRGBColorSpace] - The input color space.
	 */

	constructor(lut, {
		blendFunction = BlendFunction.SRC,
		tetrahedralInterpolation = false,
		inputColorSpace = SRGBColorSpace
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
		this.inputColorSpace = inputColorSpace;
		this.lut = lut;

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

				} else if(value instanceof Data3DTexture) {

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

				// Refresh settings that affect the LUT.
				this.tetrahedralInterpolation = tetrahedralInterpolation;

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

			if(this.tetrahedralInterpolation && lut instanceof Data3DTexture) {

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

				if(lut instanceof Data3DTexture) {

					// Interpolate samples manually.
					lut.minFilter = NearestFilter;
					lut.magFilter = NearestFilter;

				} else {

					console.warn("Tetrahedral interpolation requires a 3D texture");

				}

			}

			lut.needsUpdate = true;

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
