import { Uniform, Vector2 } from "three";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/chromatic-aberration.frag";
import vertexShader from "./glsl/chromatic-aberration.vert";

/**
 * A chromatic aberration effect.
 */

export class ChromaticAberrationEffect extends Effect {

	/**
	 * Constructs a new chromatic aberration effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Vector2} [options.offset] - The color offset.
	 * @param {Boolean} [options.radialModulation=false] - Whether the effect should be modulated with a radial gradient.
	 * @param {Number} [options.modulationOffset=0.15] - The modulation offset. Only applies if `radialModulation` is enabled.
	 */

	constructor({
		offset = new Vector2(1e-3, 5e-4),
		radialModulation = false,
		modulationOffset = 0.15
	} = {}) {

		super("ChromaticAberrationEffect", fragmentShader, {
			vertexShader,
			attributes: EffectAttribute.CONVOLUTION,
			uniforms: new Map([
				["offset", new Uniform(offset)],
				["modulationOffset", new Uniform(modulationOffset)]
			])
		});

		this.radialModulation = radialModulation;

	}

	/**
	 * The color offset.
	 *
	 * @type {Vector2}
	 */

	get offset() {

		return this.uniforms.get("offset").value;

	}

	set offset(value) {

		this.uniforms.get("offset").value = value;

	}

	/**
	 * Indicates whether radial modulation is enabled.
	 *
	 * When enabled, the effect will be weaker in the middle and stronger towards the screen edges.
	 *
	 * @type {Boolean}
	 */

	get radialModulation() {

		return this.defines.has("RADIAL_MODULATION");

	}

	set radialModulation(value) {

		if(value) {

			this.defines.set("RADIAL_MODULATION", "1");

		} else {

			this.defines.delete("RADIAL_MODULATION");

		}

		this.setChanged();

	}

	/**
	 * The modulation offset.
	 *
	 * @type {Number}
	 */

	get modulationOffset() {

		return this.uniforms.get("modulationOffset").value;

	}

	set modulationOffset(value) {

		this.uniforms.get("modulationOffset").value = value;

	}

	/**
	 * Returns the color offset vector.
	 *
	 * @deprecated Use offset instead.
	 * @return {Vector2} The offset.
	 */

	getOffset() {

		return this.offset;

	}

	/**
	 * Sets the color offset vector.
	 *
	 * @deprecated Use offset instead.
	 * @param {Vector2} value - The offset.
	 */

	setOffset(value) {

		this.offset = value;

	}

}
