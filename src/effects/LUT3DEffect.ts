import {
	ColorSpace,
	FloatType,
	HalfFloatType,
	LinearFilter,
	NearestFilter,
	SRGBColorSpace,
	Uniform,
	Vector3
} from "three";

import { LookupTexture } from "../textures/lut/LookupTexture.js";
import { LUTDomainBounds } from "../textures/lut/LUTDomainBounds.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/lut-3d.frag";

/**
 * LUT3DEffect options.
 *
 * @category Effects
 */

export interface LUT3DEffectOptions {

	/**
	 * The LUT.
	 */

	lut?: LookupTexture | null;

	/**
	 * Indicates whether tetrahedral interpolation is enabled.
	 *
	 * Tetrahedral interpolation produces highly accurate results but is slower than hardware interpolation.
	 *
	 * @defaultValue false
	 */

	tetrahedralInterpolation?: boolean;

	/**
	 * The input color space.
	 *
	 * @defaultValue SRGBColorSpace
	 */

	inputColorSpace?: ColorSpace;

}

/**
 * A 3D LUT effect.
 *
 * The tetrahedral interpolation algorithm was inspired by an implementation from OpenColorIO which is licensed under
 * the BSD 3-Clause License.
 *
 * @see https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-24-using-lookup-tables-accelerate-color
 * @see https://www.nvidia.com/content/GTC/posters/2010/V01-Real-Time-Color-Space-Conversion-for-High-Resolution-Video.pdf
 * @see https://github.com/AcademySoftwareFoundation/OpenColorIO/blob/master/src/OpenColorIO/ops/lut3d/
 * @see https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
 * @category Effects
 */

export class LUT3DEffect extends Effect implements LUT3DEffectOptions {

	/**
	 * Constructs a new LUT effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		lut = null,
		tetrahedralInterpolation = false,
		inputColorSpace = SRGBColorSpace
	}: LUT3DEffectOptions = {}) {

		super("LUT3DEffect");

		this.fragmentShader = fragmentShader;

		const uniforms = this.input.uniforms;
		uniforms.set("lut", new Uniform(null));
		uniforms.set("scale", new Uniform(new Vector3()));
		uniforms.set("offset", new Uniform(new Vector3()));
		uniforms.set("domainMin", new Uniform(null));
		uniforms.set("domainMax", new Uniform(null));

		const defines = this.input.defines;
		defines.set("LUT_SIZE", "0");
		defines.set("LUT_TEXEL_WIDTH", "0");
		defines.set("LUT_TEXEL_HEIGHT", "0");

		this.tetrahedralInterpolation = tetrahedralInterpolation;
		this.inputColorSpace = inputColorSpace;
		this.lut = lut;

	}

	/**
	 * Indicates whether the LUT uses high precision.
	 */

	private get lutPrecisionHigh(): boolean {

		return this.input.defines.has("LUT_PRECISION_HIGH");

	}

	private set lutPrecisionHigh(value: boolean) {

		if(this.lutPrecisionHigh !== value) {

			if(value) {

				this.input.defines.set("LUT_PRECISION_HIGH", true);

			} else {

				this.input.defines.delete("LUT_PRECISION_HIGH");

			}

			this.setChanged();

		}

	}

	get lut(): LookupTexture | null {

		return this.input.uniforms.get("lut")!.value as LookupTexture;

	}

	set lut(value: LookupTexture | null) {

		const { defines, uniforms } = this.input;
		uniforms.get("lut")!.value = value;

		if(value === null) {

			return;

		}

		const image = value.image;
		defines.set("LUT_SIZE", Math.min(image.width, image.height).toFixed(16));
		defines.set("LUT_TEXEL_WIDTH", (1.0 / image.width).toFixed(16));
		defines.set("LUT_TEXEL_HEIGHT", (1.0 / image.height).toFixed(16));

		this.lutPrecisionHigh = (value.type === FloatType || value.type === HalfFloatType);

		const domainData = value.userData as LUTDomainBounds;
		const min = domainData.domainMin;
		const max = domainData.domainMax;

		uniforms.get("domainMin")!.value = min.clone();
		uniforms.get("domainMax")!.value = max.clone();

		if(min.x !== 0 || min.y !== 0 || min.z !== 0 || max.x !== 1 || max.y !== 1 || max.z !== 1) {

			defines.set("CUSTOM_INPUT_DOMAIN", true);

		} else {

			defines.delete("CUSTOM_INPUT_DOMAIN");

		}

		this.configureTetrahedralInterpolation();
		this.updateScaleOffset();
		this.setChanged();

	}

	/**
	 * Updates the scale and offset for the LUT sampling coordinates.
	 */

	private updateScaleOffset(): void {

		const lut = this.lut;

		if(lut === null) {

			return;

		}

		const size = Math.min(lut.image.width, lut.image.height);
		const scale = this.input.uniforms.get("scale")!.value as Vector3;
		const offset = this.input.uniforms.get("offset")!.value as Vector3;

		const domainBounds = lut.userData as LUTDomainBounds;

		if(this.tetrahedralInterpolation) {

			if(this.input.defines.has("CUSTOM_INPUT_DOMAIN")) {

				const domainScale = domainBounds.domainMax.clone().sub(domainBounds.domainMin);
				scale.setScalar(size - 1).divide(domainScale);
				offset.copy(domainBounds.domainMin).negate().multiply(scale);

			} else {

				scale.setScalar(size - 1);
				offset.setScalar(0);

			}

		} else if(this.input.defines.has("CUSTOM_INPUT_DOMAIN")) {

			const domainScale = domainBounds.domainMax.clone().sub(domainBounds.domainMin).multiplyScalar(size);
			scale.setScalar(size - 1).divide(domainScale);
			offset.copy(domainBounds.domainMin).negate().multiply(scale).addScalar(1.0 / (2.0 * size));

		} else {

			scale.setScalar((size - 1) / size);
			offset.setScalar(1.0 / (2.0 * size));

		}

	}

	/**
	 * Configures parameters for tetrahedral interpolation.
	 */

	private configureTetrahedralInterpolation(): void {

		const lut = this.lut;

		if(lut === null) {

			return;

		}

		lut.minFilter = LinearFilter;
		lut.magFilter = LinearFilter;

		if(this.tetrahedralInterpolation) {

			// Interpolate manually.
			lut.minFilter = NearestFilter;
			lut.magFilter = NearestFilter;

		}

		lut.needsUpdate = true;

	}

	get tetrahedralInterpolation(): boolean {

		return this.input.defines.has("TETRAHEDRAL_INTERPOLATION");

	}

	set tetrahedralInterpolation(value: boolean) {

		if(value) {

			this.input.defines.set("TETRAHEDRAL_INTERPOLATION", true);

		} else {

			this.input.defines.delete("TETRAHEDRAL_INTERPOLATION");

		}

		this.configureTetrahedralInterpolation();
		this.updateScaleOffset();
		this.setChanged();

	}

}
