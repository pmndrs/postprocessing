import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragmentShader from "./glsl/depth/shader.frag";

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
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Boolean} [options.inverted=false] - Whether the depth values should be inverted.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, inverted = false } = {}) {

		super("DepthEffect", fragmentShader, {

			blendFunction,
			attributes: EffectAttribute.DEPTH

		});

		this.inverted = inverted;

	}

	/**
	 * Indicates whether depth will be inverted.
	 *
	 * @type {Boolean}
	 */

	get inverted() {

		return this.defines.has("INVERTED");

	}

	/**
	 * Enables or disables depth inversion.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set inverted(value) {

		value ? this.defines.set("INVERTED", "1") : this.defines.delete("INVERTED");

	}

}
