import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/soft-light.frag";

/**
 * Soft light.
 *
 * @category Blending
 */

export class SoftLightBlendFunction extends BlendFunction {

	/**
	 * Constructs a new soft light blend function.
	 */

	constructor() {

		super("soft-light", shader);

	}

}
