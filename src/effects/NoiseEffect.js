import { Uniform } from "three";
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
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Boolean} [options.snow=false] - Enables white noise.
	 * @param {Number} [options.intensity=1.0] - The intensity of the effect.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			snow: false,
			intensity: 1.0
		}, options);

		super("NoiseEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["intensity", new Uniform(settings.intensity)]
			])

		});

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
