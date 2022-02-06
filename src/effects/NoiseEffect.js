import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/noise/shader.frag";

/**
 * A noise effect.
 */

export class NoiseEffect extends Effect {

	/**
	 * Constructs a new noise effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Boolean} [options.premultiply=false] - Whether the noise should be multiplied with the input colors prior to blending.
	 */

	constructor({ blendFunction = BlendFunction.SCREEN, premultiply = false } = {}) {

		super("NoiseEffect", fragmentShader, { blendFunction });
		this.setPremultiplied(premultiply);

	}

	/**
	 * Indicates whether noise will be multiplied with the input colors prior to blending.
	 *
	 * @type {Boolean}
	 * @deprecated Use isPremultiplied() instead.
	 */

	get premultiply() {

		return this.isPremultiplied();

	}

	/**
	 * Controls whether noise should be multiplied with the input colors prior to blending.
	 *
	 * @type {Boolean}
	 * @deprecated Use setPremultiplied() instead.
	 */

	set premultiply(value) {

		this.setPremultiplied(value);

	}

	/**
	 * Indicates whether noise will be multiplied with the input colors prior to blending.
	 *
	 * @return {Boolean} Whether noise is premultiplied.
	 */

	isPremultiplied() {

		return this.defines.has("PREMULTIPLIED");

	}

	/**
	 * Controls whether noise should be multiplied with the input colors prior to blending.
	 *
	 * @param {Boolean} value - Whether noise should be premultiplied.
	 */

	setPremultiplied(value) {

		if(this.isPremultiplied() !== value) {

			if(value) {

				this.defines.set("PREMULTIPLIED", "1");

			} else {

				this.defines.delete("PREMULTIPLIED");

			}

			this.setChanged();

		}

	}

}
