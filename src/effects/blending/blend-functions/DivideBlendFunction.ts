import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/divide.frag";

/**
 * Color division. Supports HDR.
 *
 * @group Blending
 */

export class DivideBlendFunction extends BlendFunction {

	/**
	 * Constructs a new divide blend function.
	 */

	constructor() {

		super("divide", shader, true);

	}

}
