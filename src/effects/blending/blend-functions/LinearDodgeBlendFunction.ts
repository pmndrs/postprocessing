import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/linear-dodge.frag";

/**
 * Same as add but limits the result to 1.
 *
 * @group Blending
 */

export class LinearDodgeBlendFunction extends BlendFunction {

	/**
	 * Constructs a new linear dodge blend function.
	 */

	constructor() {

		super("linear-dodge", shader);

	}

}
