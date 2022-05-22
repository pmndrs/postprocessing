import { FloatType, HalfFloatType, Uniform } from "three";
import { BlendFunction } from "../enums";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/lut-1d.frag";

/**
 * A 1D LUT effect.
 */

export class LUT1DEffect extends Effect {

	/**
	 * Constructs a new color grading effect.
	 *
	 * @param {Texture} lut - The lookup texture.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 */

	constructor(lut, { blendFunction } = {}) {

		super("LUT1DEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([["lut", new Uniform(null)]])
		});

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

		this.uniforms.get("lut").value = value;

		if(value && (value.type === FloatType || value.type === HalfFloatType)) {

			this.defines.set("LUT_PRECISION_HIGH", "1");

		}

	}

}
