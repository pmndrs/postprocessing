import { Uniform, Vector2 } from "three";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect, EffectAttribute } from "./Effect";

import fragmentShader from "./glsl/chromatic-aberration/shader.frag";
import vertexShader from "./glsl/chromatic-aberration/shader.vert";

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

	constructor({
		blendFunction = BlendFunction.NORMAL,
		offset = new Vector2(0.001, 0.0005)
	} = {}) {

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
	 * @deprecated Use getOffset() instead.
	 */

	get offset() {

		return this.getOffset();

	}

	/**
	 * @type {Vector2}
	 * @deprecated Use setOffset() instead.
	 */

	set offset(value) {

		this.setOffset(value);

	}

	/**
	 * Returns the color offset vector.
	 *
	 * @return {Vector2} The offset.
	 */

	getOffset() {

		return this.uniforms.get("offset").value;

	}

	/**
	 * Sets the color offset vector.
	 *
	 * @param {Vector2} value - The offset.
	 */

	setOffset(value) {

		this.uniforms.get("offset").value = value;

	}

}
