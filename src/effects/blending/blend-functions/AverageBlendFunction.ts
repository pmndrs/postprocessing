import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/average.frag";

/**
 * Calculates the average of the new color and the base color. Supports HDR.
 *
 * @group Blending
 */

export class AverageBlendFunction extends BlendFunction {

	/**
	 * Constructs a new average blend function.
	 */

	constructor() {

		super(shader, true);

	}

}
