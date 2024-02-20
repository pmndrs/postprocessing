import { Uniform } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/color-depth.frag";

/**
 * ColorDepthEffect options.
 *
 * @category Effects
 */

export interface ColorDepthEffectOptions {

	/**
	 * The color bit depth.
	 *
	 * @defaultValue 16
	 */

	bits?: number;

}

/**
 * A color depth effect.
 *
 * Simulates a hardware limitation to create a retro feel. The real color depth remains unchanged.
 *
 * @category Effects
 */

export class ColorDepthEffect extends Effect {

	/**
	 * The current amount of bits.
	 */

	private _bits: number = 0;

	/**
	 * Constructs a new color depth effect.
	 *
	 * @param options - The options.
	 */

	constructor({ bits = 16 }: ColorDepthEffectOptions = {}) {

		super("ColorDepthEffect");

		this.fragmentShader = fragmentShader;

		const uniforms = this.input.uniforms;
		uniforms.set("factor", new Uniform(0.0));

		this.bitDepth = bits;

	}

	/**
	* The virtual amount of color bits.
	*
	* Each color channel effectively uses a fourth of the total amount of bits. Alpha remains unaffected.
	*/

	get bitDepth(): number {

		return this._bits;

	}

	set bitDepth(value: number) {

		this._bits = value;
		this.input.uniforms.get("factor")!.value = Math.pow(2.0, value / 3.0);

	}

}
