import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/negation.frag";

/**
 * Negates the base color using the new color.
 *
 * @group Blending
 */

export class NegationBlendFunction extends BlendFunction {

	/**
	 * Constructs a new negation blend function.
	 */

	constructor() {

		super(shader);

	}

}
