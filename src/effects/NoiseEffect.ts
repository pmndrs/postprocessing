import { ScreenBlendFunction } from "./blending/index.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/noise.frag";

/**
 * A noise effect options
 *
 * @category Effects
 */

export interface NoiseEffectOptions {
	/**
     * The blend function of this effect.
     */
	blendFunction?: ScreenBlendFunction;

	/**
     * Whether the noise should be multiplied with the input colors prior to blending.
     */
	premultiply?: boolean;
}


/**
 * A noise effect.
 *
 * @category Effects
 */


export class NoiseEffect extends Effect {

	/**
	 * Constructs a new noise effect.
	 *
	 */

	constructor({
		blendFunction,
		premultiply = false
	}: NoiseEffectOptions = {}) {

		super("NoiseEffect");

		this.fragmentShader = fragmentShader;
		this.blendMode.blendFunction = blendFunction ?? new ScreenBlendFunction();


		this.premultiply = premultiply;

	}

	/**
     * Indicates whether noise will be multiplied with the input colors prior to blending.
     *
     */

	get premultiply(): boolean {

		return this.input.defines.has("PREMULTIPLY");

	}


	/**
	 * Enables or disables premultiplication of the noise.
	 *
	 */

	set premultiply(value: boolean) {

		if(this.premultiply !== value) {

			if(value) {

				this.input.defines.set("PREMULTIPLY", "1");

			} else {

				this.input.defines.delete("PREMULTIPLY");

			}

			this.setChanged();

		}

	}


}
