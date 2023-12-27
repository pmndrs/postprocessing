import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/subtract.frag";

/**
 * Subtracts the new color from the base color.
 *
 * @group Blending
 */

export class SubtractBlendFunction extends BlendFunction {

	/**
	 * Constructs a new subtract blend function.
	 */

	constructor() {

		super(shader);

	}

}
