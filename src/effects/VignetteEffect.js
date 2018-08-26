import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/vignette/shader.frag";

/**
 * A vignette effect.
 */

export class VignetteEffect extends Effect {

	/**
	 * Constructs a new vignette effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Boolean} [options.eskil=false] - Enables Eskil's vignette technique.
	 * @param {Number} [options.offset=1.0] - The vignette offset.
	 * @param {Number} [options.darkness=1.0] - The vignette darkness.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			eskil: false,
			offset: 1.0,
			darkness: 1.0
		}, options);

		super("VignetteEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["offset", new Uniform(settings.offset)],
				["darkness", new Uniform(settings.darkness)]
			])

		});

		if(settings.eskil) {

			this.defines.set("ESKIL", "1");

		}

	}

}
