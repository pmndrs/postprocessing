import { Uniform, Vector2 } from "three";
import { BlendFunction, EffectAttribute } from "../enums";
import { Effect } from "./Effect";

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
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Vector2} [options.offset] - The color offset.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, offset = new Vector2(0.001, 0.0005) } = {}) {

		super("ChromaticAberrationEffect", fragmentShader, {
			vertexShader,
			blendFunction,
			attributes: EffectAttribute.CONVOLUTION,
			uniforms: new Map([
				["offset", new Uniform(offset)]
			])
		});

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
