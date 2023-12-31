import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/soft-light.frag";

/**
 * Soft light.
 *
 * @group Blending
 */

export class SoftLightBlendFunction extends BlendFunction {

	/**
	 * Constructs a new soft light blend function.
	 */

	constructor() {

		super("soft-light", shader);

	}

}
