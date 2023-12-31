import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/mix.frag";

/**
 * Linearly interpolates from the base color to the new one. Supports HDR.
 *
 * @group Blending
 */

export class MixBlendFunction extends BlendFunction {

	/**
	 * Constructs a new mix blend function.
	 */

	constructor() {

		super("mix", shader, true);

	}

}
