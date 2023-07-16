import { Uniform } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/color-depth.frag";

/**
 * A color depth effect.
 *
 * Simulates a hardware limitation to create a retro feel. The real color depth remains unchanged.
 */

export class ColorDepthEffect extends Effect {

	/**
	 * Constructs a new color depth effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Number} [options.bits=16] - The color bit depth.
	 */

	constructor({ blendFunction, bits = 16 } = {}) {

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
		this.bitDepth = bits;

	}

	/**
	 * The virtual amount of color bits.
	 *
	 * Each color channel effectively uses a fourth of the total amount of bits. Alpha remains unaffected.
	 *
	 * @type {Number}
	 */

	get bitDepth() {

		return this.bits;

	}

	set bitDepth(value) {

		this.bits = value;
		this.uniforms.get("factor").value = Math.pow(2.0, value / 3.0);

	}

	/**
	 * Returns the current color bit depth.
	 *
	 * @return {Number} The bit depth.
	 */

	getBitDepth() {

		return this.bitDepth;

	}

	/**
	 * Sets the virtual amount of color bits.
	 *
	 * @param {Number} value - The bit depth.
	 */

	setBitDepth(value) {

		this.bitDepth = value;

	}

}
