import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/linear-light.frag";

/**
 * Linear light.
 *
 * @group Blending
 */

export class LinearLightBlendFunction extends BlendFunction {

	/**
	 * Constructs a new linear light blend function.
	 */

	constructor() {

		super(shader);

	}

}
