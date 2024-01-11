import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/divide.frag";

/**
 * Color division. Supports HDR.
 *
 * @category Blending
 */

export class DivideBlendFunction extends BlendFunction {

	/**
	 * Constructs a new divide blend function.
	 */

	constructor() {

		super("divide", shader, true);

	}

}
