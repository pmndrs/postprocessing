import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/linear-burn.frag";

/**
 * Linear burn.
 *
 * @category Blending
 */

export class LinearBurnBlendFunction extends BlendFunction {

	/**
	 * Constructs a new linear burn blend function.
	 */

	constructor() {

		super("linear-burn", shader);

	}

}
