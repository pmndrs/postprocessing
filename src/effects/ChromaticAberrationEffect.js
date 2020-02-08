import { Uniform, Vector2 } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

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

	/**
	 * @type {Vector2}
	 */

	set offset(value) {

		this.uniforms.get("offset").value = value;

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(alpha) {

			this.defines.set("ALPHA", "1");

		} else {

			this.defines.delete("ALPHA");

		}

	}

}
