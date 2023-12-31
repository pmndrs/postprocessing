import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/pin-light.frag";

/**
 * Pin light.
 *
 * @group Blending
 */

export class PinLightBlendFunction extends BlendFunction {

	/**
	 * Constructs a new pin light blend function.
	 */

	constructor() {

		super("pin-light", shader);

	}

}
