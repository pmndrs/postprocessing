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
	 * @param {Number} [options.offset=0.5] - The vignette offset.
	 * @param {Number} [options.darkness=0.5] - The vignette darkness.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			eskil: false,
			offset: 0.5,
			darkness: 0.5
		}, options);

		super("VignetteEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["offset", new Uniform(settings.offset)],
				["darkness", new Uniform(settings.darkness)]
			])

		});

		this.eskil = settings.eskil;

	}

	/**
	 * Indicates whether Eskil's vignette technique is enabled.
	 *
	 * @type {Boolean}
	 */

	get eskil() {

		return this.defines.has("ESKIL");

	}

	/**
	 * Enables or disables Eskil's vignette technique.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set eskil(value) {

		value ? this.defines.set("ESKIL", "1") : this.defines.delete("ESKIL");

	}

}
