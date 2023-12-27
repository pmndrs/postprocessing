import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/linear-burn.frag";

/**
 * Linear burn.
 *
 * @group Blending
 */

export class LinearBurnBlendFunction extends BlendFunction {

	/**
	 * Constructs a new linear burn blend function.
	 */

	constructor() {

		super(shader);

	}

}
