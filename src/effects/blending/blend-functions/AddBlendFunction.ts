import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/add.frag";

/**
 * Additive blending. Supports HDR.
 *
 * @category Blending
 */

export class AddBlendFunction extends BlendFunction {

	/**
	 * Constructs a new add blend function.
	 */

	constructor() {

		super("add", shader, true);

	}

}
