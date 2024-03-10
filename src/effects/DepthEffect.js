import { BlendFunction } from "../enums/BlendFunction.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/depth.frag";

/**
 * A depth visualization effect.
 *
 * Useful for debugging.
 */

export class DepthEffect extends Effect {

	/**
	 * Constructs a new depth effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 * @param {Boolean} [options.inverted=false] - Whether the depth should be inverted.
	 */

	constructor({ blendFunction = BlendFunction.SRC, inverted = false } = {}) {

		super("DepthEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.DEPTH
		});

		this.inverted = inverted;

	}

	/**
	 * Indicates whether depth should be inverted.
	 *
	 * @type {Boolean}
	 */

	get inverted() {

		return this.defines.has("INVERTED");

	}

	set inverted(value) {

		if(this.inverted !== value) {

			if(value) {

				this.defines.set("INVERTED", "1");

			} else {

				this.defines.delete("INVERTED");

			}

			this.setChanged();

		}

	}

	/**
	 * Indicates whether the rendered depth is inverted.
	 *
	 * @deprecated Use inverted instead.
	 * @return {Boolean} Whether the rendered depth is inverted.
	 */

	isInverted() {

		return this.inverted;

	}

	/**
	 * Enables or disables depth inversion.
	 *
	 * @deprecated Use inverted instead.
	 * @param {Boolean} value - Whether depth should be inverted.
	 */

	setInverted(value) {

		this.inverted = value;

	}

}
