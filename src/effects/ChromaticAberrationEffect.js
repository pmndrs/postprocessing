import { Uniform, Vector2 } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/chromatic-aberration/shader.frag";

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

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			offset: new Vector2(0.01, 0.01)
		}, options);

		super("ChromaticAberrationEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["active", new Uniform(true)],
				["offset", new Uniform(settings.offset)]
			])

		});

	}

	/**
	 * The color offset for red and blue.
	 *
	 * @type {Vector2}
	 */

	get offset() {

		return this.uniforms.get("offset").value;

	}

	/**
	 * @type {Vector2}
	 */

	set offset(value) {

		this.uniforms.get("offset").value = value;

	}

}
