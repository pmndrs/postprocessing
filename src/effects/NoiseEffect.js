import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/noise/shader.frag";

/**
 * A noise effect.
 */

export class NoiseEffect extends Effect {

	/**
	 * Constructs a new noise effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.MULTIPLY] - The blend function of this effect.
	 * @param {Boolean} [options.snow=false] - Enables white noise. Works best with `BlendFunction.ADD`.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.MULTIPLY,
			snow: false
		}, options);

		super("NoiseEffect", fragment, { blendFunction: settings.blendFunction });

		this.snow = settings.snow;

	}

	/**
	 * Indicates whether white noise is enabled.
	 *
	 * @type {Boolean}
	 */

	get snow() {

		return this.defines.has("SNOW");

	}

	/**
	 * Enables or disables white noise.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set snow(value) {

		value ? this.defines.set("SNOW", "1") : this.defines.delete("SNOW");

	}

}
