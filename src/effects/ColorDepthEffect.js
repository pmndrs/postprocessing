import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/color-depth/shader.frag";

/**
 * A color depth effect.
 *
 * Simulates a hardware limitation to achieve a retro feel.
 */

export class ColorDepthEffect extends Effect {

	/**
	 * Constructs a new color depth effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.bits=16] - The color bit depth.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, bits = 16 } = {}) {

		super("ColorDepthEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["factor", new Uniform(1.0)]
			])

		});

		/**
		 * The current amount of bits.
		 *
		 * @type {Number}
		 * @private
		 */

		this.bits = 0;

		this.setBitDepth(bits);

	}

	/**
	 * Returns the current color bit depth.
	 *
	 * @return {Number} The color bit depth.
	 */

	getBitDepth() {

		return this.bits;

	}

	/**
	 * Sets the virtual amount of color bits.
	 *
	 * Each color channel will use a third of the available bits. The alpha
	 * channel remains unaffected.
	 *
	 * Note that the real color depth will not be altered by this effect.
	 *
	 * @param {Number} bits - The new color bit depth.
	 */

	setBitDepth(bits) {

		this.bits = bits;
		this.uniforms.get("factor").value = Math.pow(2.0, bits / 3.0);

	}

}
